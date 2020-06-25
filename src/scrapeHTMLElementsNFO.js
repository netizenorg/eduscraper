const axios = require('axios')
const cheerio = require('cheerio')
const { save, cleanStr, isSingleton } = require('./utils.js')

async function scrapeHTMLElementsNFO (destination, cb) {
  const url = 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element'
  const res = await axios.get(url)

  const code = res.request.res.statusCode
  if (code !== 200) return cb(code)
  else if (!res.data) cb(res)

  const dictionary = {}
  const $ = cheerio.load(res.data)

  $('.standard-table > tbody > tr').each((i, ele) => {
    // { element, description, singleton, depreciated }
    const data = {}
    const warning = $(ele).parent().parent().prev().hasClass('warning')
    if (warning) data.deprecated = true
    else data.depreciated = false
    $(ele).children().each((j, ch) => {
      if (j === 0) {
        data.element = {}
        data.element.html = cleanStr($(ch).html(), true, false)
        data.element.text = $(ch).text()
        data.element.name = $(ch).text().replace(/[<>]/g, '')
      } else if (j === 1) {
        data.description = {}
        data.description.html = cleanStr($(ch).html(), true, false)
        data.description.text = $(ch).text()
      }
    })
    data.singleton = isSingleton(data.element.name)
    dictionary[data.element.name] = data
  })

  save(dictionary, `${destination}/html-elements.json`)
}

module.exports = scrapeHTMLElementsNFO
