const axios = require('axios')
const cheerio = require('cheerio')
const { save } = require('./utils.js')

async function scrapeJSnfo (url, file, destination, cb) {
  const res = await axios.get(url)

  const code = res.request.res.statusCode
  if (code !== 200) return cb(code)
  else if (!res.data) cb(res)

  const dictionary = {}
  const $ = cheerio.load(res.data)
  const std = $('.section-content > ul')
  const root = 'https://developer.mozilla.org'
  let type = ''
  $('li', std).each((i, ele) => {
    const sub = $('a', ele)
    const url = root + $(sub[0]).attr('href')
    let txt = $(sub[0]).text()
    if (sub[0].children[0].name) {
      type = txt
    } else {
      txt = txt.replace(' event', '')
      if (!dictionary[txt]) dictionary[txt] = []
      if ($(sub[0]).attr('class') !== 'page-not-created') {
        dictionary[txt].push({
          status: 'standard',
          type: type,
          url: url,
          keyword: {
            html: `<a target="_blank" href="${url}">${txt}</a>`,
            text: txt
          }
          // description: { html: html, text: text }
        })
      }
    }
  })
  save(dictionary, `${destination}/${file}.json`)
  return dictionary
}

module.exports = scrapeJSnfo
