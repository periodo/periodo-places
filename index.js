const fs = require('fs')
    , request = require('request-promise-native')
    , n3 = require('n3')
    , jsonld = require('jsonld')
    , R = require('ramda')
    , { inspect } = require('util')

const queryTemplate = fs.readFileSync('country-query.rq', 'utf8')

const turtleParser = new n3.Parser()

const context = {
  dcterms: 'http://purl.org/dc/terms/',
  foaf: 'http://xmlns.com/foaf/0.1/',
  geojson: 'https://purl.org/geojson/vocab#',
  gn: 'http://www.geonames.org/ontology#',
  lpo: 'http://linkedpasts.org/ontology/lpo_latest.ttl#',
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  wdt: 'http://www.wikidata.org/prop/direct/',

  id: '@id',
  type: '@type',

  Feature: 'geojson:Feature',

  ccode3: 'wdt:P298',
  ccode: 'gn:countryCode',
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

const queryWikidata = countryCode => request({
  uri: 'https://query.wikidata.org/sparql',
  qs: {query: queryTemplate.replace('${country_code}', countryCode)},
  headers: {accept: 'text/turtle'},
})

const parseTurtle = ttl => new Promise((resolve, reject) => {
  const quads = []
  turtleParser.parse(
    ttl,
    (err, quad) => err ? reject(err) : quad ? quads.push(quad) : resolve(quads)
  )
})

const frameJSONLD = quads => jsonld.frame(quads, frame)

const hasBlankNodeID = R.allPass([
  R.has('id'),
  R.propSatisfies(R.startsWith('/b0_'), 'id')
])

const stripBlankNodeIDs = R.when(
  R.is(Object),
  R.pipe(
    R.when(hasBlankNodeID, R.dissoc('id')),
    R.map(x => stripBlankNodeIDs(x))
  )
)

const getWikidataCountry = countryCode => queryWikidata(countryCode)
  .then(parseTurtle)
  .then(jsonld.fromRDF)
  .then(frameJSONLD)
  .then(R.path(['@graph', 0]))
  .then(stripBlankNodeIDs)


const dump = x => console.log(inspect(x, false, null, true))

getWikidataCountry('THA')
  .then(dump)
  .catch(console.error)
