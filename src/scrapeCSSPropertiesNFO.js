const axios = require('axios')
const cheerio = require('cheerio')
const cmcss = require('./data/cm-css-mode.json')
// const { save, cleanStr, isSingleton } = require('./utils.js')

async function scrapeCSSTricks (cb) {
  const url = 'https://css-tricks.com/almanac/'
  const res = await axios.get(url)

  const code = res.request.res.statusCode
  if (code !== 200) return cb(code)
  else if (!res.data) cb(res)

  const dictionary = {}
  const $ = cheerio.load(res.data)
  $('.property-list > ol').each((i, ele) => {
    $(ele).children().each((i, ch) => {
      const a = $(ch).first().children()[0]
      dictionary[$(a).text()] = {
        urls: {
          'css-tricks': $(a).attr('href')
        }
      }
    })
  })

  return dictionary
}

async function scrapeRawMDNdata (cb) {
  const url = 'https://raw.githubusercontent.com/mdn/data/master/css/properties.json'
  const res = await axios.get(url)

  const code = res.request.res.statusCode
  if (code !== 200) return cb(code)
  else if (!res.data) cb(res)

  const dictionary = {}
  for (const key in res.data) {
    // TODO: consider including more from here
    dictionary[key] = {
      default: res.data[key].initial,
      status: res.data[key].status,
      urls: {
        mdn: res.data[key].mdn_url
      }
    }
  }

  return dictionary
}

async function scrapeW3Schools (cb) {
  const url = 'https://www.w3schools.com/cssref/'
  const res = await axios.get(url)

  const code = res.request.res.statusCode
  if (code !== 200) return cb(code)
  else if (!res.data) cb(res)

  const dictionary = {}
  const $ = cheerio.load(res.data)
  $('.w3-table-all tr').each((i, ele) => {
    const a = $($(ele).children()[0]).children()[0]
    const info = $(ele).children()[1]
    dictionary[$(a).text()] = {
      description: $(info).text(),
      urls: {
        w3schools: $(a).attr('href')
      }
    }
  })
  return dictionary
}

async function scrapeCSSPropertiesNFO (destination, cb) {
  // const dictionary = {}

  const dictionary = cmcss.propertyKeywords
  console.log(Object.keys(dictionary).length) // 426

  // const d = await scrapeCSSTricks(cb)
  // console.log(Object.keys(d).length) // 181

  // const d = await scrapeRawMDNdata(cb)
  // console.log(Object.keys(d).length) // 499 (362 standard)

  // const d = await scrapeW3Schools(cb)
  // console.log(Object.keys(d).length) // 213

  // save(dictionary, `${destination}/html-elements.json`)
}

module.exports = scrapeCSSPropertiesNFO
