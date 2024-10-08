const fs = require("fs"),
  request = require("request-promise-native"),
  n3 = require("n3"),
  jsonld = require("jsonld"),
  R = require("ramda"),
  stringify = require("jsonld-stable-stringify"),
  wkx = require("wkx"),
  { sleep } = require("sleep"),
  linkedPlace = require("./linked-place"),
  convexHull = require("./convex-hull");

const userAgent =
  "PeriodO/1.0 (http://perio.do/; ryanshaw@unc.edu) request/2.88";

const GAZETTEERS = {
  "afghan-provinces": "Afghan provinces",
  "algerian-provinces": "Algerian provinces",
  "azerbaijani-districts": "Azerbaijani districts and cities",
  "beninese-departments": "Beninese departments",
  "bolivian-departments": "Bolivian departments",
  "burkinabe-regions": "Burkinabé regions",
  cities: "Cities",
  continents: "Continents",
  countries: "Countries",
  "djiboutian-regions": "Djiboutian regions",
  "egyptian-governorates": "Egyptian governorates",
  "english-counties": "English counties",
  "ethiopian-regions": "Ethiopian regions",
  "french-regions": "French regions",
  "gambian-regions": "Gambian regions",
  "geographic-regions": "Geographic regions",
  "georgian-regions": "Georgian regions",
  "greek-regions": "Greek administrative regions",
  "guinean-regions": "Guinean regions",
  historical: "Historical places",
  "indian-states": "Indian states and union territories",
  "indonesian-provinces": "Indonesian provinces",
  "iranian-provinces": "Iranian provinces",
  "iraqi-governorates": "Iraqi and Kurdish governorates",
  "israeli-districts": "Israeli districts",
  "italian-regions": "Italian regions",
  "jordanian-governorates": "Jordanian governorates",
  "kuwaiti-governorates": "Kuwaiti governorates",
  "kyrgyz-regions": "Kyrgyz regions",
  "laotian-provinces": "Laotian provinces",
  "lebanese-governorates": "Lebanese governorates",
  "libyan-districts": "Libyan districts",
  "malaysian-states": "Malaysian states and federal territories",
  "myanma-states": "Myanma states and regions",
  "nigerian-states": "Nigerian states",
  "nigerien-regions": "Nigerien regions",
  "omani-governorates": "Omani governorates",
  "other-regions": "Other regions",
  "pakistani-provinces": "Pakistani provinces and territories",
  "philippine-regions": "Philippine regions",
  "romanian-counties": "Romanian counties",
  "russian-federal-subjects": "Russian federal subjects",
  "saudi-arabian-provinces": "Saudi Arabian provinces",
  "spanish-communities": "Spanish autonomous communities",
  subregions: "Subcontinental regions",
  "sudanese-states": "Sudanese states",
  "syrian-governorates": "Syrian governorates",
  "tajikistani-regions": "Tajikistani regions",
  "thai-provinces": "Thai provinces",
  "turkish-provinces": "Turkish provinces",
  "turkmen-regions": "Turkmen regions",
  "ukrainian-oblasts": "Ukrainian oblasts",
  "us-states": "US states",
  "uzbek-regions": "Uzbek regions",
  "vietnamese-provinces": "Vietnamese provinces and municipalities",
  "yemeni-governorates": "Yemeni governorates",
};

const queryTemplate = fs.readFileSync("wikidata-query.rq", "utf8");

const context = {
  dcterms: "http://purl.org/dc/terms/",
  foaf: "http://xmlns.com/foaf/0.1/",
  geojson: "https://purl.org/geojson/vocab#",
  gn: "http://www.geonames.org/ontology#",
  gsp: "http://www.opengis.net/ont/geosparql#",
  lpo: "http://linkedpasts.org/ontology/lpo_latest.ttl#",
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  wdt: "http://www.wikidata.org/prop/direct/",

  id: "@id",
  type: "@type",

  Feature: "geojson:Feature",
  FeatureCollection: "geojson:FeatureCollection",
  GeometryCollection: "geojson:GeometryCollection",
  Polygon: "geojson:Polygon",
  MultiPolygon: "geojson:MultiPolygon",

  ccode: "gn:countryCode",
  features: "geojson:features",
  identifier: { "@id": "dcterms:identifier", "@type": "@id" },
  label: "rdfs:label",
  lang: "dcterms:language",
  properties: "geojson:properties",
  title: "dcterms:title",
  toponym: "lpo:toponym",
  value: "rdf:value",
  northernmostPoint: "wdt:P1332",
  southernmostPoint: "wdt:P1333",
  easternmostPoint: "wdt:P1334",
  westernmostPoint: "wdt:P1335",
  geoshape: "wdt:P3896",

  types: {
    "@id": "lpo:type_attestation",
    "@container": "@set",
  },
  names: {
    "@id": "lpo:name_attestation",
    "@container": "@set",
  },
  descriptions: {
    "@id": "dcterms:description",
    "@container": "@set",
  },
  depictions: {
    "@id": "foaf:depiction",
    "@container": "@set",
  },
  coordinates: {
    "@id": "geojson:coordinates",
    "@container": "@list",
  },
};

const frame = {
  "@type": "geojson:Feature",
  "@context": context,
};

const replace = (tag) => (replacement) => (string) =>
  string.replace(new RegExp(`\\$\\{${tag}\\}`, "g"), replacement);

const quote = (value) => `"${value}"`;

const queryWikidata = (id, types, constraints) => {
  if (R.contains(["wdt:P297|wdt:P300", "NL"], constraints)) {
    // confusion between the country and the kingdom; we want the former
    id = "http://www.wikidata.org/entity/Q55";
    // Q55 does not have ISO 3166-1 alpha-2 code
    constraints = [];
  }

  let query = R.pipe(
    replace("bindings")(R.isNil(id) ? "" : `BIND(<${id}> AS ?place)`),
    replace("types")(
      R.compose(
        R.join(" UNION "),
        R.map((type) => `{ ?place (wdt:P31/wdt:P279*) ${type} . }`),
      )(types),
    ),
    replace("constraints")(
      R.compose(
        R.join(""),
        R.map(
          ([path, value]) =>
            `?place ${path} ${
              R.startsWith("wd:", value) ? value : quote(value)
            } . `,
        ),
      )(constraints),
    ),
  )(queryTemplate);

  //console.error(query)

  return request({
    uri: "https://query.wikidata.org/sparql",
    qs: { query },
    headers: { accept: "text/turtle", "user-agent": userAgent },
  });
};

const parseTurtle = (ttl) =>
  new Promise((resolve, reject) => {
    const quads = [];
    new n3.Parser().parse(ttl, (err, quad) =>
      err ? reject(err) : quad ? quads.push(quad) : resolve(quads),
    );
  });

const frameJSONLD = (quads) => jsonld.frame(quads, frame);

const hasBlankNodeID = R.allPass([
  R.has("id"),
  R.propSatisfies(R.startsWith("n3-"), "id"),
]);

const stripBlankNodeIDs = R.when(
  R.is(Object),
  R.pipe(
    R.when(hasBlankNodeID, R.dissoc("id")),
    R.map((x) => stripBlankNodeIDs(x)),
  ),
);

const wktToGeoJSON = (value) =>
  value.type === "gsp:wktLiteral"
    ? R.pipe(R.toUpper, wkx.Geometry.parse, (g) => g.toGeoJSON())(
        value["@value"],
      )
    : value;

const addGeometryFromExtremePoints = (place) => {
  if (
    R.has("northernmostPoint", place) &&
    R.has("westernmostPoint", place) &&
    R.has("southernmostPoint", place) &&
    R.has("easternmostPoint", place)
  ) {
    return R.assoc(
      "geometry",
      {
        type: "GeometryCollection",
        geometries: [
          {
            type: "Polygon",
            coordinates: [
              [
                place.northernmostPoint.coordinates,
                place.westernmostPoint.coordinates,
                place.southernmostPoint.coordinates,
                place.easternmostPoint.coordinates,
                place.northernmostPoint.coordinates,
              ],
            ],
          },
        ],
      },
      place,
    );
  } else {
    return place;
  }
};

const COMMONS_QS = {
  action: "query",
  prop: "revisions",
  rvslots: "*",
  rvprop: "content",
  format: "json",
  origin: "*",
};

const addGeometryFromWikimediaCommons = (place) =>
  new Promise((resolve, _) => {
    if (R.has("geoshape", place)) {
      const titles = `Data:${place.geoshape.id.split("/Data:").pop()}`;
      request({
        uri: "https://commons.wikimedia.org/w/api.php",
        qs: { titles, ...COMMONS_QS },
        json: true,
        qsStringifyOptions: { encode: false },
      })
        .then((o) => {
          let geo = null;
          for (const [_, v] of Object.entries(o.query.pages)) {
            geo = JSON.parse(v.revisions[0].slots.main["*"]);
            break;
          }
          if (geo) {
            resolve(
              R.assoc(
                "geometry",
                {
                  type: "GeometryCollection",
                  geometries: [convexHull(geo.data.features[0].geometry)],
                },
                place,
              ),
            );
          } else {
            resolve(place);
          }
        })
        .catch(console.error);
    } else {
      resolve(place);
    }
  });

const getWikidataPlace = (id = null, types = [], constraints = []) =>
  new Promise((resolve, reject) =>
    queryWikidata(id, types, constraints)
      .then(parseTurtle)
      .then(linkedPlace)
      .then(jsonld.fromRDF)
      .then(frameJSONLD)
      .then(R.dissoc("@context"))
      .then(stripBlankNodeIDs)
      .then(R.map(wktToGeoJSON))
      .then(addGeometryFromExtremePoints)
      .then(addGeometryFromWikimediaCommons)
      //.then(R.tap(console.error))
      .then(resolve)
      .catch(reject),
  );

const getWikidataCountry = (code) =>
  getWikidataPlace(
    null,
    [
      "wd:Q6256", // country
      "wd:Q10711424", // state with limited recognition
      "wd:Q15239622", // disputed territory
      "wd:Q1763527", // constituent state
      "wd:Q185086", // British crown dependency
      "wd:Q46395", // British overseas territory
    ],
    [["wdt:P297|wdt:P300", code]], // ISO 3166-1 alpha-2 code or ISO 3166-2 code
    // (the latter is for UK countries)
  );

const getWikidataUSState = (code) =>
  getWikidataPlace(
    null,
    ["wd:Q852446"], // administrative territorial entity of the US
    [["wdt:P297|wdt:P300", code]], // ISO 3166-1 alpha-2 code or ISO 3166-2 code
    // (the former for unincorporated territories)
  );

const getWikidataHistoricalPlace = (id) =>
  getWikidataPlace(id, [
    "wd:Q3024240", // historical country
    "wd:Q28171280", // ancient civilization
    "wd:Q839954", // archaeological site
  ]);

const getWikidataContinent = (id) =>
  getWikidataPlace(
    id,
    id === "http://www.wikidata.org/entity/Q2" // Earth
      ? []
      : ["wd:Q5107"], // continent
  );

const getWikidataRegion = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q618123"], // geographical feature
  );

const getWikidataEnglishCounty = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q180673"], // ceremonial county of England
  );

const getWikidataCity = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q486972"], // human settlement
  );

const getWikidataSpanishCommunity = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q10742"], // autonomous community of Spain
  );

const getWikidataItalianRegion = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q16110"], // region of Italy
  );

const getWikidataGreekRegion = (id) =>
  getWikidataPlace(
    id,
    id === "http://www.wikidata.org/entity/Q780149" // Monastic Republic of Mount Athos
      ? ["wd:Q788176"] // autonomous administrative territorial entity
      : ["wd:Q207299"], // administrative region of Greece
  );

const getWikidataIndianState = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q131541"], // states and union territories of India
  );

const getWikidataRussianFederalSubject = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q43263"], // federal subject of Russia
  );

const getWikidataKuwaitiGovernorate = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q842876"], // governorate of Kuwait
  );

const getWikidataSaudiProvince = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q15623255"], // administrative territorial entity of Saudi Arabia
  );

const getWikidataLaotianProvince = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q15673297"], // province of Laos
  );

const getWikidataFrenchRegion = (id) =>
  getWikidataPlace(id, [
    "wd:Q36784", // region of France
    "wd:Q22670030", // former French region
    "wd:Q202216", // overseas department and region of France
  ]);

const getWikidataSyrianGovernorate = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q517351"], // governorate of Syria
  );

const getWikidataEgyptianGovernorate = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q204910"], // governorate of Egypt
  );

const getWikidataLibyanDistrict = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q48242"], // district of Libya
  );

const getWikidataAlgerianProvince = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q240601"], // province of Algeria
  );

const getWikidataPakistaniProvince = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q270496"], // administrative territorial entity of Pakistan
    [["(wdt:P31/wdt:P279*)", "wd:Q10864048"]], // first-level administrative country subdivision
  );

const getWikidataTajikistaniRegion = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q867545"], // region of Tajikistan
  );

const getWikidataTurkmenRegion = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q12014176"], // region of Turkmenistan
  );

const getWikidataIranianProvince = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q1344695"], // province of Iran
  );

const getWikidataLebaneseGovernorate = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q844713"], // governorate of Lebanon
  );

const getWikidataTurkishProvince = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q48336"], // province of Turkey
  );

const getWikidataIraqiGovernorate = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q841753"], // governorate of Iraq
  );

const getWikidataYemeniGovernorate = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q331130"], // governorate of Yemen
  );

const getWikidataOmaniGovernorate = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q641078"], // governorate of Oman
  );

const getWikidataDjiboutianRegion = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q1202812"], // region of Djibouti
  );

const getWikidataEthiopianRegion = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q1057504"], // region of Ethiopia
  );

const getWikidataThaiProvince = (id) =>
  getWikidataPlace(
    id,
    id === "http://www.wikidata.org/entity/Q1861" // Bangkok
      ? ["wd:Q15634695"] // special administrative area of Thailand
      : ["wd:Q50198"], // province of Thailand
  );

const getWikidataVietnameseProvince = (id) =>
  getWikidataPlace(id, [
    "wd:Q2824648", // province of Vietname
    "wd:Q1381899", // municipality of Vietnam
  ]);

const getWikidataMyanmaState = (id) =>
  getWikidataPlace(id, [
    "wd:Q17315624", // state of Myanmar
    "wd:Q15072454", // region of Myanmar
  ]);

const getWikidataPhilippineRegion = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q24698"], // region of the Philippines
  );

const getWikidataIndonesianProvince = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q5098"], // province of Indonesia
  );

const getWikidataAzerbaijaniDistrict = (id) =>
  getWikidataPlace(id, [
    "wd:Q13417250", // district of Azerbaijan
    "wd:Q56557664", // şəhər
  ]);

const getWikidataIsraeliDistrict = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q193560"], // district of Israel
  );

const getWikidataBolivianDepartment = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q250050"], // department of Bolivia
  );

const getWikidataUkrainianOblast = (id) =>
  getWikidataPlace(
    id,
    id === "http://www.wikidata.org/entity/Q1899" // Kyiv
      ? ["wd:Q5124045"] // city with special status
      : ["wd:Q3348196"], // oblast of Ukraine
  );

const getWikidataGeorgianRegion = (id) =>
  getWikidataPlace(
    id,
    id === "http://www.wikidata.org/entity/Q45693" // Adjara
      ? ["wd:Q244339"] // administrative territorial entity of Georgia
      : ["wd:Q1210300"], // mkhare
  );

const getWikidataUzbekRegion = (id) =>
  getWikidataPlace(
    id,
    id === "http://www.wikidata.org/entity/Q269" || // Tashkent
      id === "http://www.wikidata.org/entity/Q484245" // Karakalpakstan
      ? ["wd:Q7631083"] // administrative territorial entity of Uzbekistan
      : ["wd:Q842420"], // region of Uzbekistan
  );

const getWikidataMalaysianState = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q50464"], // state or federal territory of Malaysia
  );

const getWikidataNigerienRegion = (id) =>
  getWikidataPlace(
    id,
    id === "http://www.wikidata.org/entity/Q3674" // Niamey
      ? ["wd:Q5119"] // capital
      : ["wd:Q859869"], // region of Niger
  );

const getWikidataNigerianState = (id) =>
  getWikidataPlace(
    id,
    id === "http://www.wikidata.org/entity/Q509300" // Federal Capital Territory
      ? ["wd:Q3330995"] // administrative territorial entity of Nigeria
      : ["wd:Q465842"], // state of Nigeria
  );

const getWikidataGuineanRegion = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q1067116"], // region of Guinea
  );

const getWikidataGambianRegion = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q15646510"], // region of the Gambia
  );

const getWikidataBurkinabeRegion = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q867094"], // region of Burkino Faso
  );

const getWikidataBenineseDepartment = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q792929"], // department of Benin
  );

const getWikidataJordanianGovernorate = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q867567"], // governorate of Jordan
  );

const getWikidataKyrgyzRegion = (id) =>
  getWikidataPlace(
    id,
    id === "http://www.wikidata.org/entity/Q9361" // Bishkek
      ? ["wd:Q15623974"] // administrative territorial entity of Kyrgyzstan
      : ["wd:Q693039"], // region of Kyrgyzstan
  );

const getWikidataSudaneseState = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q746290"], // state of Sudan
  );

const getWikidataAfghanProvince = (id) =>
  getWikidataPlace(
    id,
    ["wd:Q158683"], // province of Afghanistan
  );

const getWikidataRomanianCounty = (id) =>
  getWikidataPlace(
    id,
    id === "http://www.wikidata.org/entity/Q19660" // Bucharest
      ? ["wd:Q640364"] // municipality of Romania
      : ["wd:Q1776764"], // județ
  );

const makeFeature = (place, gazetteer) =>
  new Promise((resolve) => {
    let promise, ccode;
    switch (gazetteer) {
      case "countries":
        promise = getWikidataCountry(place.code);
        break;
      case "us-states":
        promise = getWikidataUSState(place.code);
        ccode = place.code.length === 2 ? place.code : "US";
        break;
      case "historical":
        promise = getWikidataHistoricalPlace(place.id);
        break;
      case "continents":
        promise = getWikidataContinent(place.id);
        break;
      case "geographic-regions":
      case "other-regions":
      case "subregions":
        promise = getWikidataRegion(place.id);
        break;
      case "english-counties":
        promise = getWikidataEnglishCounty(place.id);
        break;
      case "cities":
        promise = getWikidataCity(place.id);
        break;
      case "spanish-communities":
        promise = getWikidataSpanishCommunity(place.id);
        break;
      case "italian-regions":
        promise = getWikidataItalianRegion(place.id);
        break;
      case "greek-regions":
        promise = getWikidataGreekRegion(place.id);
        break;
      case "indian-states":
        promise = getWikidataIndianState(place.id);
        break;
      case "russian-federal-subjects":
        promise = getWikidataRussianFederalSubject(place.id);
        break;
      case "kuwaiti-governorates":
        promise = getWikidataKuwaitiGovernorate(place.id);
        break;
      case "saudi-arabian-provinces":
        promise = getWikidataSaudiProvince(place.id);
        break;
      case "laotian-provinces":
        promise = getWikidataLaotianProvince(place.id);
        break;
      case "french-regions":
        promise = getWikidataFrenchRegion(place.id);
        break;
      case "syrian-governorates":
        promise = getWikidataSyrianGovernorate(place.id);
        break;
      case "egyptian-governorates":
        promise = getWikidataEgyptianGovernorate(place.id);
        break;
      case "libyan-districts":
        promise = getWikidataLibyanDistrict(place.id);
        break;
      case "algerian-provinces":
        promise = getWikidataAlgerianProvince(place.id);
        break;
      case "pakistani-provinces":
        promise = getWikidataPakistaniProvince(place.id);
        break;
      case "tajikistani-regions":
        promise = getWikidataTajikistaniRegion(place.id);
        break;
      case "turkmen-regions":
        promise = getWikidataTurkmenRegion(place.id);
        break;
      case "iranian-provinces":
        promise = getWikidataIranianProvince(place.id);
        break;
      case "lebanese-governorates":
        promise = getWikidataLebaneseGovernorate(place.id);
        break;
      case "turkish-provinces":
        promise = getWikidataTurkishProvince(place.id);
        break;
      case "iraqi-governorates":
        promise = getWikidataIraqiGovernorate(place.id);
        break;
      case "yemeni-governorates":
        promise = getWikidataYemeniGovernorate(place.id);
        break;
      case "omani-governorates":
        promise = getWikidataOmaniGovernorate(place.id);
        break;
      case "djiboutian-regions":
        promise = getWikidataDjiboutianRegion(place.id);
        break;
      case "ethiopian-regions":
        promise = getWikidataEthiopianRegion(place.id);
        break;
      case "thai-provinces":
        promise = getWikidataThaiProvince(place.id);
        break;
      case "vietnamese-provinces":
        promise = getWikidataVietnameseProvince(place.id);
        break;
      case "myanma-states":
        promise = getWikidataMyanmaState(place.id);
        break;
      case "philippine-regions":
        promise = getWikidataPhilippineRegion(place.id);
        break;
      case "indonesian-provinces":
        promise = getWikidataIndonesianProvince(place.id);
        break;
      case "azerbaijani-districts":
        promise = getWikidataAzerbaijaniDistrict(place.id);
        break;
      case "israeli-districts":
        promise = getWikidataIsraeliDistrict(place.id);
        break;
      case "bolivian-departments":
        promise = getWikidataBolivianDepartment(place.id);
        break;
      case "ukrainian-oblasts":
        promise = getWikidataUkrainianOblast(place.id);
        break;
      case "georgian-regions":
        promise = getWikidataGeorgianRegion(place.id);
        break;
      case "uzbek-regions":
        promise = getWikidataUzbekRegion(place.id);
        break;
      case "malaysian-states":
        promise = getWikidataMalaysianState(place.id);
        break;
      case "nigerien-regions":
        promise = getWikidataNigerienRegion(place.id);
        break;
      case "nigerian-states":
        promise = getWikidataNigerianState(place.id);
        break;
      case "guinean-regions":
        promise = getWikidataGuineanRegion(place.id);
        break;
      case "gambian-regions":
        promise = getWikidataGambianRegion(place.id);
        break;
      case "burkinabe-regions":
        promise = getWikidataBurkinabeRegion(place.id);
        break;
      case "beninese-departments":
        promise = getWikidataBenineseDepartment(place.id);
        break;
      case "jordanian-governorates":
        promise = getWikidataJordanianGovernorate(place.id);
        break;
      case "kyrgyz-regions":
        promise = getWikidataKyrgyzRegion(place.id);
        break;
      case "sudanese-states":
        promise = getWikidataSudaneseState(place.id);
        break;
      case "afghan-provinces":
        promise = getWikidataAfghanProvince(place.id);
        break;
      case "romanian-counties":
        promise = getWikidataRomanianCounty(place.id);
        break;
      default:
        throw new Error(`unknown gazetteer: ${gazetteer}`);
    }
    promise
      .then((feature) => {
        if (ccode || place.code) {
          feature.properties.ccode = ccode || place.code;
        }
        // add geometry from input data, if provided
        if (place.geometry) {
          feature.geometry = {
            type: "GeometryCollection",
            geometries: [convexHull(place.geometry)],
          };
        }
        if (!feature.geometry) {
          console.error(
            `Missing geometry: ${feature.properties.title} <${feature.id}>`,
          );
        }
        resolve(feature);
      })
      .catch((o) => resolve(`${o.error ? o.error : o}`));
  });

async function main(geometries, gazetteer, debugPlace) {
  const placeGeometries = JSON.parse(fs.readFileSync(geometries, "utf8"));
  const features = [];
  for (let place in placeGeometries) {
    if (debugPlace && debugPlace !== place) {
      continue;
    }
    const result = await makeFeature(placeGeometries[place], gazetteer);
    if (R.is(String, result)) {
      console.error(`${place}:\n${result}`);
    } else {
      features.push(result);
    }
    sleep(1);
  }
  const g = {
    "@context": R.clone(context),
    type: "FeatureCollection",
    title: GAZETTEERS[gazetteer],
    features: R.sortBy(R.path(["properties", "title"]), features),
  };
  // ugly hack: pretend features is a list so it doesn't get re-sorted
  g["@context"]["features"] = {
    "@id": "geojson:features",
    "@container": "@list",
  };
  console.log(
    stringify(g, {
      space: "  ",
      replacer: (k, v) => (k === "@context" ? context : v),
    }),
  );
}

const usage = () => {
  console.error(`
Usage: ${process.argv[1]} [geometries JSON] [gazetteer]

[gazetteer] must be one of: ${R.join(", ", Object.keys(GAZETTEERS))}
`);
  process.exit(1);
};

if (process.argv.length < 4) {
  usage();
}

const geometries = process.argv[2],
  gazetteer = process.argv[3],
  debugPlace = process.argv[4];

if (!R.has(gazetteer, GAZETTEERS)) {
  usage();
}

main(geometries, gazetteer, debugPlace).catch(console.error);
