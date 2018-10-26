const fs = require('fs')
    , request = require('request-promise-native')
    , n3 = require('n3')
    , jsonld = require('jsonld')
    , R = require('ramda')
    , { sleep } = require('sleep')

const queryTemplate = fs.readFileSync('wikidata-query.rq', 'utf8')

const context = {
  dcterms: 'http://purl.org/dc/terms/',
  foaf: 'http://xmlns.com/foaf/0.1/',
  geojson: 'https://purl.org/geojson/vocab#',
  gn: 'http://www.geonames.org/ontology#',
  lpo: 'http://linkedpasts.org/ontology/lpo_latest.ttl#',
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',

  id: '@id',
  type: '@type',

  Feature: 'geojson:Feature',
  FeatureCollection: 'geojson:FeatureCollection',
  GeometryCollection: 'geojson:GeometryCollection',
  Polygon: 'geojson:Polygon',
  MultiPolygon: 'geojson:MultiPolygon',

  ccode: 'gn:countryCode',
  features: 'geojson:features',
  identifier: {'@id': 'dcterms:identifier', '@type': '@id'},
  label: 'rdfs:label',
  lang: 'dcterms:language',
  properties: 'geojson:properties',
  title: 'dcterms:title',
  toponym: 'lpo:toponym',
  value: 'rdf:value',

  types: {
    '@id': 'lpo:type_attestation',
    '@container': '@set'
  },
  names: {
    '@id': 'lpo:name_attestation',
    '@container': '@set'
  },
  descriptions: {
    '@id': 'dcterms:description',
    '@container': '@set'
  },
  depictions: {
    '@id': 'foaf:depiction',
    '@container': '@set'
  }
}

const frame = {
  '@type': 'geojson:Feature',
  '@context': context
}

const fixedMappings = {
  // confusion between the country and the kingdom; we want the former
  NL: 'http://www.wikidata.org/entity/Q55'
}

const queryWikidata = (code, type) => {
  let query = queryTemplate.replace('${code}', code).replace('${type}', type)
  if (code in fixedMappings) {
    query = query.replace(`BIND("${code}" AS ?code)`, `
BIND("${code}" AS ?code)
BIND(<${fixedMappings[code]}> AS ?place)`)
  }
  return request({
    uri: 'https://query.wikidata.org/sparql',
    qs: {query},
    headers: {accept: 'text/turtle'}
  })
}

const parseTurtle = ttl => new Promise((resolve, reject) => {
  const quads = []
  new n3.Parser().parse(
    ttl,
    (err, quad) => err ? reject(err) : quad ? quads.push(quad) : resolve(quads)
  )
})

const frameJSONLD = quads => jsonld.frame(quads, frame)

const hasBlankNodeID = R.allPass([
  R.has('id'),
  R.propSatisfies(R.startsWith('/b'), 'id')
])

const stripBlankNodeIDs = R.when(
  R.is(Object),
  R.pipe(
    R.when(hasBlankNodeID, R.dissoc('id')),
    R.map(x => stripBlankNodeIDs(x))
  )
)

const getWikidataPlace = (code, type) => new Promise((resolve, reject) =>
  queryWikidata(code, type)
    .then(parseTurtle)
    .then(R.when(R.isEmpty, () => reject('no results')))
    .then(jsonld.fromRDF)
    .then(frameJSONLD)
    .then(R.path(['@graph', 0]))
    .then(stripBlankNodeIDs)
    .then(resolve)
    .catch(reject)
)

const makeFeature = ({code, geometry}, type, ccode) => new Promise(resolve =>
  getWikidataPlace(code, type)
    .then(feature => {
      feature.properties.ccode = ccode || code
      feature.geometry = {type: 'GeometryCollection', geometries: [geometry]}
      resolve(feature)
    })
    .catch(resolve)
)

async function main(geometries, type, ccode) {
  const gazetteer = {
    '@context': context,
    type: 'FeatureCollection',
    features: []
  }
  const placeGeometries = JSON.parse(fs.readFileSync(geometries, 'utf8'))
  for (let place in placeGeometries) {
    const result = await makeFeature(placeGeometries[place], type, ccode)
    if (R.is(String, result)) {
      console.error(`${place}: ${result}`)
    } else {
      gazetteer.features.push(result)
    }
    sleep(1)
  }
  console.log(JSON.stringify(gazetteer, null, 2))
}

if (process.argv.length < 3) {
  console.log(`Usage: ${process.argv[1]} [geometries JSON]`)
  process.exit(1)
}

const geometries = process.argv[2]
    , type = process.argv[3]
    , ccode = process.argv[4]

main(geometries, type, ccode)
.catch(console.error)
