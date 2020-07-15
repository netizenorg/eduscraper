const axios = require('axios')
const cheerio = require('cheerio')
const { save } = require('./utils.js')

const ignore = [
  'Block',
  'Empty',
  'for each...in',
  'for await...of',
  'Property accessors',
  '++A',
  '--A'
]

const translate = {
  '...obj': '...',
  'async function': 'async',
  'for...in': 'in',
  'for...of': 'of',
  '/ab+c/i': 'regex',
  'A++': '++',
  'A--': '--',
  '(condition ? ifTrue : ifFalse)': '?'
}

async function scrapeJSRefs (url, file, destination, cb) {
  const res = await axios.get(url)

  const code = res.request.res.statusCode
  if (code !== 200) return cb(code)
  else if (!res.data) cb(res)

  const dictionary = {}
  const $ = cheerio.load(res.data)
  $('.card-grid li a').each((i, ele) => {
    const root = 'https://developer.mozilla.org'
    const url = root + $(ele).attr('href')
    let name = $(ele).text()

    let alias
    if (translate[name]) {
      name = translate[name]
    } else if (name.includes('...') && !ignore.includes(name)) {
      const arr = name.split('...')
      name = arr[0]
      alias = arr[1]
    }

    if (!ignore.includes(name)) {
      dictionary[name] = {
        status: 'standard',
        url: url,
        keyword: {
          html: url ? `<a target="_blank" href="${url}">${name}</a>` : name,
          text: name
        }
      }
    }

    if (alias) dictionary[alias] = dictionary[name]
  })
  save(dictionary, `${destination}/${file}.json`)
  return dictionary
}

module.exports = scrapeJSRefs
