const fs = require('fs')
    , request = require('request-promise-native')
    , n3 = require('n3')
    , jsonld = require('jsonld')
    , R = require('ramda')
    , stringify = require('jsonld-stable-stringify')
    , wkx = require('wkx')
    , { sleep } = require('sleep')
    , linkedPlace = require('./linked-place')
    , convexHull = require('./convex-hull')

const GAZETTEERS = {
  cities: 'Cities',
  continents: 'Continents',
  countries: 'Countries',
  'english-counties': 'English counties',
  historical: 'Historical places',
  'italian-regions': 'Italian regions',
  subregions: 'Subcontinental regions',
  'spanish-communities': 'Spanish autonomous communities',
  'us-states': 'US states'
}

const queryTemplate = fs.readFileSync('wikidata-query.rq', 'utf8')

const context = {
  dcterms: 'http://purl.org/dc/terms/',
  foaf: 'http://xmlns.com/foaf/0.1/',
  geojson: 'https://purl.org/geojson/vocab#',
  gn: 'http://www.geonames.org/ontology#',
  gsp: 'http://www.opengis.net/ont/geosparql#',
  lpo: 'http://linkedpasts.org/ontology/lpo_latest.ttl#',
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  wdt: 'http://www.wikidata.org/prop/direct/',

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
  northernmostPoint: 'wdt:P1332',
  southernmostPoint: 'wdt:P1333',
  easternmostPoint: 'wdt:P1334',
  westernmostPoint: 'wdt:P1335',

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
  },
  coordinates: {
    '@id': 'geojson:coordinates',
    '@container': '@list'
  }
}

const frame = {
  '@type': 'geojson:Feature',
  '@context': context
}

const replace = tag => replacement => string => string.replace(
  new RegExp(`\\$\\{${tag}\\}`, 'g'), replacement)

const queryWikidata = (id, types, constraints) => {

  if (R.contains(['wdt:P297|wdt:P300', 'NL'], constraints)) {
    // confusion between the country and the kingdom; we want the former
    id = 'http://www.wikidata.org/entity/Q55'
    // Q55 does not have ISO 3166-1 alpha-2 code
    constraints = []
  }

  let query = R.pipe(
    replace('bindings')(
      R.isNil(id) ? '' : `BIND(<${id}> AS ?place)`
    ),
    replace('types')(
      R.compose(
        R.join(' UNION '),
        R.map(type => `{ ?place (wdt:P31/wdt:P279*) ${type} . }`)
      )(types)
    ),
    replace('constraints')(
      R.compose(
        R.join(''),
        R.map(([path, value]) => `?place ${path} "${value}" . `)
      )(constraints)
    )
  )(queryTemplate)

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

const frameJSONLD = quads => jsonld.frame(quads, frame)

const hasBlankNodeID = R.allPass([
  R.has('id'),
  R.propSatisfies(R.startsWith('/n3-'), 'id')
])

const stripBlankNodeIDs = R.when(
  R.is(Object),
  R.pipe(
    R.when(hasBlankNodeID, R.dissoc('id')),
    R.map(x => stripBlankNodeIDs(x))
  )
)

const wktToGeoJSON = value => value.type === 'gsp:wktLiteral'
  ? R.pipe(R.toUpper, wkx.Geometry.parse, g => g.toGeoJSON())(value['@value'])
  : value

const addGeometryFromExtremePoints = place => {
  if (R.has('northernmostPoint', place) &&
      R.has('westernmostPoint',  place) &&
      R.has('southernmostPoint', place) &&
      R.has('easternmostPoint',  place)) {

    return R.assoc(
      'geometry',
      {type: 'GeometryCollection',
       geometries:[
         {type: 'Polygon',
          coordinates: [[
            place.northernmostPoint.coordinates,
            place.westernmostPoint.coordinates,
            place.southernmostPoint.coordinates,
            place.easternmostPoint.coordinates,
            place.northernmostPoint.coordinates
          ]]
         }
       ]
      },
      place
    )

  } else {
    return place
  }
}

const getWikidataPlace = (id = null, types = [], constraints = []) => (
  new Promise((resolve, reject) =>
    queryWikidata(id, types, constraints)
      .then(parseTurtle)
      .then(linkedPlace)
      .then(jsonld.fromRDF)
      .then(frameJSONLD)
      .then(R.path(['@graph', 0]))
      .then(stripBlankNodeIDs)
      .then(R.map(wktToGeoJSON))
      .then(addGeometryFromExtremePoints)
      .then(resolve)
      .catch(reject)
  )
)

const getWikidataCountry = code => getWikidataPlace(
  null,
  [
    'wd:Q6256',   // country
    'wd:Q185086', // British crown dependency
    'wd:Q46395'   // British overseas territory
  ],
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
  id === 'http://www.wikidata.org/entity/Q2' // Earth
    ? []
    : ['wd:Q5107'] // continent
)

const getWikidataRegion = id => getWikidataPlace(
  id,
  ['wd:Q82794'] // geographic region
)

const getWikidataEnglishCounty = id => getWikidataPlace(
  id,
  ['wd:Q180673'] // ceremonial county of England
)

const getWikidataCity = id => getWikidataPlace(
  id,
  ['wd:Q486972'] // human settlement
)

const getWikidataSpanishCommunity = id => getWikidataPlace(
  id,
  ['wd:Q10742'] // autonomous community of Spain
)

const getWikidataItalianRegion = id => getWikidataPlace(
  id,
  ['wd:Q16110'] // region of Italy
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
      case 'subregions':
        promise = getWikidataRegion(place.id)
        break
      case 'english-counties':
        promise = getWikidataEnglishCounty(place.id)
        break
      case 'cities':
        promise = getWikidataCity(place.id)
        break
      case 'spanish-communities':
        promise = getWikidataSpanishCommunity(place.id)
        break
      case 'italian-regions':
        promise = getWikidataItalianRegion(place.id)
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
          geometries: [convexHull(place.geometry)]
        }
      }
      if (! feature.geometry) {
        console.error(
          `Missing geometry: ${feature.properties.title} <${feature.id}>`)
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
Usage: ${process.argv[1]} [geometries JSON] [gazetteer]

[gazetteer] must be one of: ${R.join(', ', Object.keys(GAZETTEERS))}
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
