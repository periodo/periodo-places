const fs = require('fs')
    , split = require('split')

const found = (id, gazetteers) => {
  for (let g of gazetteers) {
    for (let f of g.features) {
      if (f.id === id) {
        return true
      }
    }
  }
  return false
}

const findDuplicatePlaces = gazetteers => {
  const ids = {}
  for (let g of gazetteers) {
    for (let f of g.features) {
      if (f.id in ids) {
        console.log(`Duplicate place in ${g.title}: ${f.id}`)
      } else {
        ids[f.id] = true
      }
    }
  }
}

const loadGazetteers = () => {
  const gazetteers = []
  for (let arg of process.argv.slice(2)) {
    gazetteers.push(JSON.parse(fs.readFileSync(arg, 'utf8')))
  }
  return gazetteers
}

function main() {
  console.log()
  const gazetteers = loadGazetteers()
  findDuplicatePlaces(gazetteers)
  process.stdin.pipe(split()).on('data', id => {
    if (id.length > 0 && ! found(id, gazetteers)) {
      console.log(`Missing: ${id}`)
    }
  })
}

main()
