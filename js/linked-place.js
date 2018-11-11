const n3 = require('n3')
    , { blankNode, namedNode, literal, quad } = n3.DataFactory
    , R = require('ramda')

const dcterms = t => `http://purl.org/dc/terms/${t}`
    , lpo = t => `http://linkedpasts.org/ontology/lpo_latest.ttl#${t}`
    , rdf = t => `http://www.w3.org/1999/02/22-rdf-syntax-ns#${t}`
    , rdfs = t => `http://www.w3.org/2000/01/rdf-schema#${t}`
    , schema = t => `http://schema.org/${t}`
    , skos = t => `http://www.w3.org/2004/02/skos/core#${t}`
    , geojson = t => `https://purl.org/geojson/vocab#${t}`

const n = prefix => t => namedNode(prefix(t))

module.exports = quads => {

  const {place, types} = R.reduce(
    ({place, types}, q) => {
      if (q.predicate.id === rdf('type')) {
        if (place === undefined) {
          return {place: q.subject, types: R.append(q.object, types)}
        } else if (place.equals(q.subject)) {
          return {place, types: R.append(q.object, types)}
        } else {
          throw new Error(`Multiple places: ${place.id} and ${q.subject.id}`)
        }
      } else {
        return {place, types}
      }
    },
    {place: undefined, types: []}
  )(quads)

  const newQuads = [
    quad(place, n(rdf)('type'), n(geojson)('Feature'))
  ]

  return R.reduce(
    (qs, q) => {
      switch (q.predicate.id) {

        case rdf('type'): {
          // ignore type assertions as we handle them above
          return qs
        }

        case rdfs('label'): {
          if (q.subject.equals(place)) {
            // reify label as properties title and name attestation
            const properties = blankNode()
            const attestation = blankNode()
            return R.concat([
              quad(place, n(geojson)('properties'), properties),
              quad(properties, n(dcterms)('title'), literal(q.object.value)),

              quad(place, n(lpo)('name_attestation'), attestation),
              quad(attestation, n(lpo)('toponym'), literal(q.object.value)),
              quad(
                attestation,
                n(dcterms)('language'),
                literal(q.object.language))
            ], qs)
          }
          else if (R.contains(q.subject, types)) {
            // reify type as type attestation
            const attestation = blankNode()
            return R.concat([
              quad(place, n(lpo)('type_attestation'), attestation),
              quad(attestation, n(dcterms)('identifier'), q.subject),
              quad(attestation, n(rdfs)('label'), literal(q.object.value))
            ], qs)
          } else {
            return R.append(q, qs)
          }
        }

        case skos('altLabel'): {
          if (q.object.value.length < 4) {
            // ignore short alternate labels
            return qs
          } else {
            // reify alternate label as name attestation
            const attestation = blankNode()
            return R.concat([
              quad(place, n(lpo)('name_attestation'), attestation),
              quad(attestation, n(lpo)('toponym'), literal(q.object.value)),
              quad(
                attestation,
                n(dcterms)('language'),
                literal(q.object.language))
            ], qs)
          }
        }

        case schema('description'): {
          // reify description as description attestation
          const description = blankNode()
          return R.concat([
            quad(place, n(dcterms)('description'), description),
            quad(description, n(rdf)('value'), literal(q.object.value)),
            quad(
              description,
              n(dcterms)('language'),
              literal(q.object.language))
          ], qs)
        }

        default:
          return R.append(q, qs)
      }
    },
    newQuads
  )(quads)
}
