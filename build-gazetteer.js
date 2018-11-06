const fs = require('fs')
    , request = require('request-promise-native')
    , n3 = require('n3')
    , jsonld = require('jsonld')
    , R = require('ramda')
    , { sleep } = require('sleep')
    , { red } = require('chalk')

const GAZETTEER_TYPES = ['countries', 'us-states', 'historical']

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

const queryWikidata = (id, types, constraints) => {

  if (R.contains(['wdt:P297|wdt:P300', 'NL'], constraints)) {
    // confusion between the country and the kingdom; we want the former
    id = 'http://www.wikidata.org/entity/Q55'
  }

  let query = queryTemplate.replace(
    '${bindings}',
    R.isNil(id) ? '' : `BIND <${id}> AS ?place`
  ).replace(
    '${types}',
    R.compose(
      R.join(' UNION '),
      R.map(type => `{ ?place (wdt:P31/wdt:P279*) ${type} . }`)
    )(types)
  ).replace(
    '${constraints}',
    R.compose(
      R.join(''),
      R.map(([path, value]) => `?place ${path} "${value}" . `)
    )(constraints)
  )

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

const getWikidataPlace = (id = null, types = [], constraints = []) => (
  new Promise((resolve, reject) =>
    queryWikidata(id, types, constraints)
      .then(parseTurtle)
      .then(R.when(R.isEmpty, () => reject('no results')))
      .then(jsonld.fromRDF)
      .then(frameJSONLD)
      .then(R.path(['@graph', 0]))
      .then(stripBlankNodeIDs)
      .then(resolve)
      .catch(reject)
  )
)

const getWikidataCountry = code => getWikidataPlace(
  null,
  ['wd:Q6256'],                 // country
  [['wdt:P297|wdt:P300', code]] // ISO 3166-1 alpha-2 code or ISO 3166-2 code
                                // (the latter is for UK countries)
)

const getWikidataUSState = code => getWikidataPlace(
  null,
  ['wd:Q35657'],       // US state
  [['wdt:P300', code]] // ISO 3166-2 code
)

const getWikidataHistoricalPlace = id => getWikidataPlace(
  id,
  [
    'wd:Q3024240',  // historical country
    'wd:Q28171280', // ancient civilization
    'wd:Q839954'    // archaeological site
  ]
)

const makeFeature = (place, type, ccode) => new Promise(
  resolve => {
    let promise
    switch (type) {
      case 'countries':
        promise = getWikidataCountry(place.code)
        break
      case 'us-states':
        promise = getWikidataUSState(place.code)
        break
      case 'historical':
        promise = getWikidataHistoricalPlace(place.id)
        break
      default:
        throw new Error(`unknown gazetteer type: ${type}`)
    }
    promise.then(feature => {
      if (ccode || place.code) {
        feature.properties.ccode = ccode || place.code
      }
      if (place.geometry) {
        feature.geometry = {
          type: 'GeometryCollection',
          geometries: [place.geometry]
        }
      }
      resolve(feature)
    }).catch(resolve)
  }
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
      console.error(red(`${place}: ${result}`))
    } else {
      gazetteer.features.push(result)
    }
    sleep(1)
  }
  console.log(JSON.stringify(gazetteer, null, 2))
}

const usage = () => {
  console.log(`
Usage: ${process.argv[1]} [geometries JSON] [type] [country code]

[type] must be one of: ${GAZETTEER_TYPES}
[country code] is optional.
`)
  process.exit(1)
}

if (process.argv.length < 3) {
  usage()
}

const geometries = process.argv[2]
    , type = process.argv[3]
    , ccode = process.argv[4]

if (! R.contains(type, GAZETTEER_TYPES)) {
  usage()
}

main(geometries, type, ccode).catch(R.pipe(red, console.error))
