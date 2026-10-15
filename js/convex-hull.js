const concaveman = require('concaveman')

const CONCAVITY = Infinity

const convexHull = points => [
  concaveman(points, CONCAVITY)
]

const collectPoints = multipolygon => multipolygon.coordinates.reduce(
  ({posLng, negLng}, rings) => rings[0][0][0] > 0 // positive longitude
    ? {posLng: posLng.concat(rings[0]), negLng}
    : {posLng, negLng: negLng.concat(rings[0])},
  {posLng: [], negLng: []}
)

const spansAllLongitudes = rings => {
  const lngs = rings[0].map(([lng]) => lng)
  return Math.max(...lngs) - Math.min(...lngs) >= 359
}

module.exports = geometry => {
  switch (geometry.type) {

    case 'Polygon':
      return {
        type: 'Polygon',
        // convex hull of exterior ring
        coordinates: convexHull(geometry.coordinates[0])
      }

    case 'MultiPolygon':
      // a ring spanning all longitudes encircles a pole (e.g. Antarctica),
      // so take the hull of all points rather than splitting them
      if (geometry.coordinates.some(spansAllLongitudes)) {
        return {
          type: 'Polygon',
          coordinates: convexHull(
            geometry.coordinates.reduce((ps, rings) => ps.concat(rings[0]), [])
          )
        }
      }
      // avoid creating polygons that cross the antimeridian
      var points = collectPoints(geometry)
      if (points.posLng.length > 0 && points.negLng.length > 0) {
        return {
          type: 'MultiPolygon',
          coordinates: [
            convexHull(points.posLng),
            convexHull(points.negLng),
          ]
        }
      }
      if (points.posLng.length > 0) {
        return {
          type: 'Polygon',
          coordinates: convexHull(points.posLng)
        }
      }
      if (points.negLng.length > 0) {
        return {
          type: 'Polygon',
          coordinates: convexHull(points.negLng)
        }
      }
      throw new Error('No points found in geometry')

    default:
      throw new Error(
        `Can't create convex hull for geometry of type: ${geometry.type}`
      )
  }
}
