const fs = require('fs')

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

function main() {
  const mapping = fs.readFileSync(process.argv[2], 'utf8').split('\n')
  const gazetteers = []
  for (let arg of process.argv.slice(3)) {
    gazetteers.push(JSON.parse(fs.readFileSync(arg, 'utf8')))
  }
  for (let line of mapping) {
    if (line.length === 0) continue
    const id = line.split('→')[1]
    if (! found(id, gazetteers)) {
      console.log(line)
    }
  }
  findDuplicatePlaces(gazetteers)
}

if (process.argv.length < 3) {
  console.log(`Usage: ${process.argv[1]} [id mapping file]`)
  process.exit(1)
}

main()
