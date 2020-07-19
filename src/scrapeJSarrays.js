const axios = require('axios')
const cheerio = require('cheerio')
const { save, cleanStr } = require('./utils.js')

const ignore = [
  'Array.prototype[@@unscopables]',
  'Array.prototype[@@iterator]()'
]

async function scrapeJSnfo (url, file, destination, cb) {
  const res = await axios.get(url)

  const code = res.request.res.statusCode
  if (code !== 200) return cb(code)
  else if (!res.data) cb(res)

  const dictionary = {}
  const $ = cheerio.load(res.data)
  $('dt').each((i, ele) => {
    const link = $('a', ele)
    const fullName = $(link).text().replace(/\s/g, '')
    if (fullName.indexOf('Array') === 0) {
      if (!fullName.includes('prototype.') || ignore.includes(fullName)) return
      const arr = fullName.split('.')
      let name = arr[arr.length - 1]
      let label = name
      if (name.includes('(')) {
        name = name.substr(0, name.indexOf('('))
        label = name + '()'
      }
      const descText = $($(ele).next()).text()
      const descHTML = cleanStr($($(ele).next()).html(), true)
      const root = 'https://developer.mozilla.org'
      const url = root + $(link).attr('href')
      dictionary[name] = {
        status: 'standard',
        url: url,
        keyword: {
          html: url ? `<a target="_blank" href="${url}">${label}</a>` : label,
          text: label
        },
        description: { html: descHTML, text: descText }
      }
    }
  })
  save(dictionary, `${destination}/${file}.json`)
  return dictionary
}

module.exports = scrapeJSnfo
