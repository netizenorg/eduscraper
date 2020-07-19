const axios = require('axios')
const cheerio = require('cheerio')
const { save, cleanStr } = require('./utils.js')

function checkForStatus ($, ele) {
  let status = 'standard'
  for (let i = 0; i < $(ele).children().length; i++) {
    const child = $(ele).children()[i]
    const t = $(child).attr('title')
    if (t) {
      if (t.includes('obsolete') || t.includes('deprecated')) {
        status = 'obsolete'
      } else if (t.includes('experimental')) {
        status = 'experimental'
      } else if (t.includes('not been standardized')) {
        status = 'non-standard'
      }
    }
  }
  return status
}

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
    if (i < 8) {
      const name = fullName.split('()')[0]
      const label = fullName.includes('()') ? name + '()' : name
      const descText = $($(ele).next()).text()
      const descHTML = cleanStr($($(ele).next()).html(), true)
      const status = checkForStatus($, ele)
      const root = 'https://developer.mozilla.org'
      const url = root + $(link).attr('href')
      dictionary[name] = {
        status: status,
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
