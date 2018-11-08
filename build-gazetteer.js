const fs = require('fs')
    , request = require('request-promise-native')
    , n3 = require('n3')
    , jsonld = require('jsonld')
    , R = require('ramda')
    , stringify = require('json-stable-stringify')
    , { sleep } = require('sleep')

const GAZETTEERS = {
  continents: 'Continents',
  countries: 'Countries',
  historical: 'Historical places',
  'us-states': 'US states'
}

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
    // Q55 does not have ISO 3166-1 alpha-2 code
    constraints = []
  }

  let query = queryTemplate.replace(
    '${bindings}',
    R.isNil(id) ? '' : `BIND(<${id}> AS ?place)`
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

  //console.error(query)

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

const isFeature = quad => (quad.predicate.id === `${context.rdf}type` &&
                           quad.object.id === `${context.geojson}Feature`)

const checkFeatureCount = quads => {
  const count = R.reduce(
    (count, quad) => (isFeature(quad) ? count + 1 : count), 0, quads)
  if (count !== 1) {
    throw new Error(`${count} results`)
  }
  return quads
}

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
      .then(checkFeatureCount)
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
  ['wd:Q852446'],               // administrative territorial entity of the US
  [['wdt:P297|wdt:P300', code]] // ISO 3166-1 alpha-2 code or ISO 3166-2 code
                                // (the former for unincorporated territories)
)

const getWikidataHistoricalPlace = id => getWikidataPlace(
  id,
  [
    'wd:Q3024240',  // historical country
    'wd:Q28171280', // ancient civilization
    'wd:Q839954'    // archaeological site
  ]
)

const getWikidataContinent = id => getWikidataPlace(
  id,
  ['wd:Q5107'] // continent
)

const makeFeature = (place, gazetteer) => new Promise(
  resolve => {
    let promise, ccode
    switch (gazetteer) {
      case 'countries':
        promise = getWikidataCountry(place.code)
        break
      case 'us-states':
        promise = getWikidataUSState(place.code)
        ccode = place.code.length === 2 ? place.code : 'US'
        break
      case 'historical':
        promise = getWikidataHistoricalPlace(place.id)
        break
      case 'continents':
        promise = getWikidataContinent(place.id)
        break
      default:
        throw new Error(`unknown gazetteer: ${gazetteer}`)
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
    }).catch(o => resolve(`${o.error ? o.error : o}`))
  }
)

async function main(geometries, gazetteer, debugPlace) {
  const g = {
    '@context': context,
    type: 'FeatureCollection',
    title: GAZETTEERS[gazetteer],
    features: []
  }
  const placeGeometries = JSON.parse(fs.readFileSync(geometries, 'utf8'))
  for (let place in placeGeometries) {
    if (debugPlace && debugPlace !== place) {
      continue
    }
    const result = await makeFeature(placeGeometries[place], gazetteer)
    if (R.is(String, result)) {
      console.error(`${place}:\n${result}`)
    } else {
      g.features.push(result)
    }
    sleep(1)
  }
  console.log(stringify(g, {space: '  '}))
}

const usage = () => {
  console.error(`
Usage: ${process.argv[1]} [geometries JSON] [gazetteer] [country code]

[gazetteer] must be one of: ${Object.keys(GAZETTEERS)}
[country code] is optional.
`)
  process.exit(1)
}

if (process.argv.length < 4) {
  usage()
}

const geometries = process.argv[2]
    , gazetteer = process.argv[3]
    , debugPlace = process.argv[4]

if (! R.has(gazetteer, GAZETTEERS)) {
  usage()
}

main(geometries, gazetteer, debugPlace).catch(console.error)
