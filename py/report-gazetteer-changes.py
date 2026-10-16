"""Report how rebuilt gazetteers differ from the committed ones.

Compares each gazetteers/*.json in the working tree with its version at
git HEAD, writes a Markdown report to stdout and a JSON report to
--json, and exits with status 1 if any gazetteer is missing places.

Usage: report-gazetteer-changes.py [--log build.log] [--memory mem.log]
                                   [--json report.json]
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

from shapely.geometry import shape

# outline changes at least this large (symmetric difference as a
# fraction of the union) are listed individually
LARGE_OUTLINE_CHANGE = 0.05


def committed(path):
    result = subprocess.run(
        ["git", "show", f"HEAD:{path}"], capture_output=True, text=True
    )
    return json.loads(result.stdout) if result.returncode == 0 else None


def outline(feature):
    if not feature.get("geometry"):
        return None
    geometry = shape(feature["geometry"])
    return geometry if geometry.is_valid else geometry.buffer(0)


def outline_change(old, new):
    """Symmetric difference as a fraction of the union, or None if
    either feature has no outline."""
    a, b = outline(old), outline(new)
    if a is None or b is None:
        return None
    union = a.union(b).area
    return a.symmetric_difference(b).area / union if union else 0.0


def names(feature):
    return {(n.get("lang"), n.get("toponym")) for n in feature.get("names", [])}


def title(feature):
    return feature["properties"].get("title")


def compare(name, old, new, expected):
    old_features = {f["id"]: f for f in old["features"]} if old else {}
    new_features = {f["id"]: f for f in new["features"]}
    report = {
        "places": [len(old_features), len(new_features)],
        "expected": expected,
        "added": [[i, title(new_features[i])] for i in sorted(new_features.keys() - old_features.keys())],
        "removed": [[i, title(old_features[i])] for i in sorted(old_features.keys() - new_features.keys())],
        "titles": [],
        "names_changed": 0,
        "other_changed": 0,
        "outlines": {"small": 0, "large": [], "gained": [], "lost": []},
    }
    for i in sorted(old_features.keys() & new_features.keys()):
        a, b = old_features[i], new_features[i]
        if title(a) != title(b):
            report["titles"].append([title(a), title(b)])
        if names(a) != names(b):
            report["names_changed"] += 1
        rest = lambda f: {k: v for k, v in f.items() if k not in ("properties", "names", "geometry")}
        if rest(a) != rest(b) or a["properties"] != b["properties"]:
            report["other_changed"] += 1
        if a.get("geometry") != b.get("geometry"):
            if not a.get("geometry"):
                report["outlines"]["gained"].append(title(b))
            elif not b.get("geometry"):
                report["outlines"]["lost"].append(title(b))
            else:
                change = outline_change(a, b)
                if change >= LARGE_OUTLINE_CHANGE:
                    report["outlines"]["large"].append([title(b), round(change, 3)])
                else:
                    report["outlines"]["small"] += 1
    report["changed"] = bool(
        report["added"] or report["removed"] or report["titles"]
        or report["names_changed"] or report["other_changed"]
        or report["outlines"]["small"] or report["outlines"]["large"]
        or report["outlines"]["gained"] or report["outlines"]["lost"]
    )
    return report


def problems_for(name, report):
    problems = []
    before, after = report["places"]
    if report["expected"] is not None and after < report["expected"]:
        problems.append(f"`{name}` has {after} places but its place-ID file lists {report['expected']}")
    elif report["expected"] is None and after < before:
        problems.append(f"`{name}` has {after} places, fewer than the {before} committed")
    return problems


def scan_log(path):
    if not path:
        return {}
    text = Path(path).read_text(errors="replace")
    zero = re.findall(r"^(.+):\nError: zero results$", text, re.M)
    return {
        "zero_results": zero,
        "retries": len(re.findall(r"retrying in", text)),
        "missing_geometry": re.findall(r"^Missing geometry: (.+) <", text, re.M),
        "union_errors": len(re.findall(r"^(Invalid geometry type|'NoneType'|no geometries supplied)", text, re.M)),
    }


def peak_memory(path):
    if not path or not Path(path).exists():
        return None
    values = [int(v) for v in Path(path).read_text().split() if v.isdigit()]
    return max(values) if values else None


def markdown(reports, problems, log, memory):
    changed = {k: v for k, v in reports.items() if v["changed"]}
    lines = ["# Gazetteer build report", ""]
    lines.append(
        f"{len(reports)} gazetteers built; {len(changed)} differ from the committed versions."
    )
    if memory:
        lines.append(f"Peak memory in use during the build: {memory:,} MB.")
    lines.append("")
    if problems:
        lines += ["## Problems", ""] + [f"- {p}" for p in problems] + [""]
    if changed:
        lines += [
            "## Changes",
            "",
            "| Gazetteer | Places | Added | Removed | Titles | Names | Other properties | Outlines (small / large) |",
            "|---|---|---|---|---|---|---|---|",
        ]
        for name, r in changed.items():
            o = r["outlines"]
            places = f"{r['places'][0]} → {r['places'][1]}" if r["places"][0] != r["places"][1] else str(r["places"][1])
            lines.append(
                f"| {name} | {places} | {len(r['added'])} | {len(r['removed'])} | {len(r['titles'])} "
                f"| {r['names_changed']} | {r['other_changed']} | {o['small']} / {len(o['large'])} |"
            )
        lines.append("")
        details = []
        for name, r in changed.items():
            items = []
            items += [f"- added: {t} <{i}>" for i, t in r["added"]]
            items += [f"- removed: {t} <{i}>" for i, t in r["removed"]]
            items += [f"- title: {a} → {b}" for a, b in r["titles"]]
            items += [f"- outline changed by {c:.1%}: {t}" for t, c in r["outlines"]["large"]]
            items += [f"- outline gained: {t}" for t in r["outlines"]["gained"]]
            items += [f"- outline lost: {t}" for t in r["outlines"]["lost"]]
            if items:
                details += [f"<details><summary>{name}</summary>", ""] + items + ["", "</details>", ""]
        if details:
            lines += ["## Details", ""] + details
    else:
        lines += ["No changes.", ""]
    if log:
        lines += ["## Build log", ""]
        lines.append(f"- Wikidata/Commons retries: {log['retries']}")
        lines.append(f"- Union errors: {log['union_errors']}")
        if log["zero_results"]:
            lines.append(f"- No Wikidata results: {', '.join(log['zero_results'])}")
        if log["missing_geometry"]:
            lines.append(f"- Places without outlines: {len(log['missing_geometry'])}")
        lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--log")
    parser.add_argument("--memory")
    parser.add_argument("--json")
    args = parser.parse_args()

    reports, problems = {}, []
    tracked = subprocess.run(
        ["git", "ls-files", "gazetteers/*.json"], capture_output=True, text=True, check=True
    ).stdout.split()
    problems += [f"`{Path(p).stem}` was not built" for p in tracked if not Path(p).exists()]
    for path in sorted(Path("gazetteers").glob("*.json")):
        name = path.stem
        try:
            new = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as e:
            problems.append(f"`{name}` could not be read: {e}")
            continue
        ids = Path("place-ids") / path.name
        expected = len(json.loads(ids.read_text(encoding="utf-8"))) if ids.exists() else None
        report = compare(name, committed(f"gazetteers/{path.name}"), new, expected)
        reports[name] = report
        problems += problems_for(name, report)

    log = scan_log(args.log)
    memory = peak_memory(args.memory)
    print(markdown(reports, problems, log, memory))
    if args.json:
        Path(args.json).write_text(
            json.dumps({"problems": problems, "log": log, "peak_memory_mb": memory, "gazetteers": reports},
                       indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
