const axios = require('axios')
const cheerio = require('cheerio')
const { save } = require('./utils.js')

async function scrapCSSColors (destination, cb) {
  const url = 'https://www.w3schools.com/colors/color_tryit.asp'
  const res = await axios.get(url)

  const code = res.request.res.statusCode
  if (code !== 200) return cb(code)
  else if (!res.data) cb(res)

  const dictionary = {}
  const $ = cheerio.load(res.data)
  $('.w3-table tr').each((i, ele) => {
    const first = $(ele).children()[0]
    const color = $(first).text().replace(/\s/g, '').toLowerCase()
    dictionary[color] = { name: color }
    $($(ele).children()).each((i, el) => {
      if (i === 1) dictionary[color].hex = '#' + $(el).text()
      else if (i === 2) {
        dictionary[color].rgb = `rgb(${$(el).text().replace(/\s/g, '')})`
      }
    })
  })
  delete dictionary.colorname
  save(dictionary, `${destination}/css-colors.json`)
  return dictionary
}

module.exports = scrapCSSColors
