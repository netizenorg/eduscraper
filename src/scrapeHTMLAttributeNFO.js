const axios = require('axios')
const cheerio = require('cheerio')
const { save, cleanStr } = require('./utils.js')

async function scrapeHTMLAttributeNFO (destination, cb) {
  const url = 'https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#Attribute_list'
  const res = await axios.get(url)

  const code = res.request.res.statusCode
  if (code !== 200) return cb(code)
  else if (!res.data) cb(res)

  const dictionary = {}
  const $ = cheerio.load(res.data)
  $('.standard-table > tbody > tr').each((i, ele) => {
    // { attribute, elements, depreciated, experimental, note, description }
    const data = {}
    $(ele).children().each((j, ch) => {
      if (j === 0) {
        data.attribute = $(ch).text().replace(/\s/g, '')
        const icon = $(ch).children()[1]
        if (icon) {
          const t = $(icon).attr('title')
          if (t.includes('experimental')) data.experimental = true
          else data.experimental = false
          if (t.includes('depreciated')) data.depreciated = true
          else data.deprecated = false
        } else {
          data.experimental = data.deprecated = false
        }
      } else if (j === 1) {
        data.elements = {}
        data.elements.html = cleanStr($(ch).html(), true, false)
        data.elements.text = $(ch).text()
      } else if (j === 2) {
        const note = $('.note', ch)
        $('.note', ch).remove()
        data.description = {}
        data.description.html = cleanStr($(ch).html(), false, true)
        data.description.text = cleanStr($(ch).text(), false, true)
        if (typeof $(note).html() === 'string') {
          data.note = {}
          data.note.html = cleanStr($(note).html(), true, true)
          data.note.text = cleanStr($(note).text(), false, true)
        } else data.note = null
      }
    })
    dictionary[data.attribute] = data
  })

  save(dictionary, `${destination}/html-attributes.json`)
}

module.exports = scrapeHTMLAttributeNFO
