const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')

function scrapeHTMLAttributeNFO (destination, cb) {
  const url = 'https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#Attribute_list'
  axios.get(url).then(res => {
    const code = res.request.res.statusCode
    if (code !== 200) return cb(code)
    const $ = cheerio.load(res.data)
    const dictionary = {}
    $('.standard-table > tbody > tr').each((i, ele) => {
      const data = {
        attribute: null,
        elements: null,
        depreciated: false,
        experimental: false,
        note: null,
        description: null
      }
      $(ele).children().each((j, ch) => {
        if (j === 0) {
          data.attribute = $(ch).text().replace(/\s/g, '')
          const icon = $(ch).children()[1]
          if (icon) {
            const t = $(icon).attr('title')
            if (t.includes('experimental')) data.experimental = true
            else if (t.includes('depreciated')) data.depreciated = true
          }
        } else if (j === 1) {
          data.elements = $(ch).html()
            .replace(/href="/g, 'href="https://developer.mozilla.org')
        } else if (j === 2) {
          const note = $('.note', ch)
          $('.note', ch).remove()
          data.description = $(ch).html()
          if (typeof $(note).html() === 'string') {
            data.note = $(note).html()
              .replace(/href="\/en/g, 'href="https://developer.mozilla.org/en')
          }
        }
      })
      dictionary[data.attribute] = data
    })

    const d = JSON.stringify(dictionary, null, 2)
    fs.writeFile(`${destination}/html-attributes.json`, d, (err) => {
      if (err) console.log(err)
    })
  }).catch(err => { cb(err) })
}

module.exports = scrapeHTMLAttributeNFO
