const fs = require('fs')

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const sparql = async (endpoint, query) => {
  const response = await fetch(
    `${endpoint}?${new URLSearchParams({query})}`,
    {headers: {accept: 'application/json'}}
  )
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
  return response.json()
}

const queryDBpedia = legacyID => sparql('http://dbpedia.org/sparql', `
PREFIX owl: <http://www.w3.org/2002/07/owl#>

SELECT DISTINCT ?id
WHERE {
  <${legacyID}> owl:sameAs ?id .
  FILTER (STRSTARTS(STR(?id), "http://www.wikidata.org/entity/"))
}
`)

const queryGeonames = legacyID => sparql('https://query.wikidata.org/sparql', `
PREFIX wdt: <http://www.wikidata.org/prop/direct/>

SELECT DISTINCT ?id
WHERE {
  ?id wdt:P1566 "${legacyID.split('/')[3]}" .
}
`)

const fixedMappings = {
  'http://dbpedia.org/resource/Palestine':
  'http://www.wikidata.org/entity/Q219060',

  'http://dbpedia.org/resource/Carthage':
  'http://www.wikidata.org/entity/Q2429397',

  'http://dbpedia.org/resource/Burma':
  'http://www.wikidata.org/entity/Q836',

  'http://dbpedia.org/resource/Messenia':
  'http://www.wikidata.org/entity/Q1247159'
}

async function main() {
  const ids = fs.readFileSync(process.argv[2], 'utf8').split('\n')
  for (let id of ids) {
    if (id.length === 0) {
      continue
    }
    if (id in fixedMappings) {
      console.log(`${id}→${fixedMappings[id]}`)
      continue
    }
    const query = id.startsWith('http://dbpedia.org/')
      ? queryDBpedia
      : queryGeonames
    const o = await query(id)
    if (o.results.bindings.length !== 1) {
      console.error(id)
    } else {
      const wikidataId = o.results.bindings[0].id.value
      console.log(`${id}→${wikidataId}`)
    }
    await sleep(1000)
  }
}

if (process.argv.length < 3) {
  console.log(`Usage: ${process.argv[1]} [legacy ids file]`)
  process.exit(1)
}

main().catch(console.error)
