const fs = require('fs')
    , request = require('request-promise-native')
    , { sleep } = require('sleep')

const queryDBpedia = legacyID => request({
  uri: 'http://dbpedia.org/sparql',
  qs: {query: `
PREFIX owl: <http://www.w3.org/2002/07/owl#>

SELECT DISTINCT ?id
WHERE {
  <${legacyID}> owl:sameAs ?id .
  FILTER (STRSTARTS(STR(?id), "http://www.wikidata.org/entity/"))
}
`},
  headers: {accept: 'application/json'},
  json: true
})

const queryGeonames = legacyID => request({
  uri: 'https://query.wikidata.org/sparql',
  qs: {query: `
PREFIX wdt: <http://www.wikidata.org/prop/direct/>

SELECT DISTINCT ?id
WHERE {
  ?id wdt:P1566 "${legacyID.split('/')[3]}" .
}
`},
  headers: {accept: 'application/json'},
  json: true
})

async function main() {
  const ids = fs.readFileSync(process.argv[2], 'utf8').split('\n')
  for (let id of ids) {
    if (id.length === 0) {
      continue
    }
    if (id === 'http://dbpedia.org/resource/Palestine') {
      console.log(`${id}→http://www.wikidata.org/entity/Q219060`)
      continue
    }
    if (id === 'http://dbpedia.org/resource/Burma') {
      id = 'http://dbpedia.org/resource/Myanmar'
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
    sleep(1)
  }
}

if (process.argv.length < 3) {
  console.log(`Usage: ${process.argv[1]} [legacy ids file]`)
  process.exit(1)
}

main().catch(console.error)
