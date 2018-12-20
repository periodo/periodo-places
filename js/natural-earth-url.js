const categoryOf = name => {
  switch (name) {
    case 'admin_0_countries':
    case 'admin_0_map_units':
    case 'admin_0_scale_rank':
    case 'admin_1_states_provinces':
    case 'populated_places':
    case 'urban_areas_landscan':
      return 'cultural'
    case 'geography_regions_polys':
      return 'physical'
    default:
      throw new Error(name)
  }
}

const host = 'www.naturalearthdata.com'

const path = process.argv[2].split('/')
    , zipfile = path.slice(-1)[0]
    , match = zipfile.match(/ne_([1,5]{1,2}0m)_([0-9a-z_]+).zip/)
    , scale = match[1]
    , category = categoryOf(match[2])

console.log(
  `https://${host}/http//${host}/download/${scale}/${category}/${zipfile}`
)
