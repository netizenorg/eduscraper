const axios = require('axios')
const cheerio = require('cheerio')
const cmcss = require('./data/cm-css-mode.json')
const { save } = require('./utils.js')

async function scrapeCSSTricks (cb) {
  const url = 'https://css-tricks.com/almanac/'
  const res = await axios.get(url)

  const code = res.request.res.statusCode
  if (code !== 200) return cb(code)
  else if (!res.data) cb(res)

  const edgeCases = [
    'grid-row / grid-column',
    'grid-template-columns / grid-template-rows',
    'top / bottom / left / right'
  ]
  const dictionary = {}
  const $ = cheerio.load(res.data)
  $('.property-list > ol').each((i, ele) => {
    $(ele).children().each((i, ch) => {
      const a = $(ch).first().children()[0]
      const prop = $(a).text()
      if (edgeCases.includes(prop)) {
        prop.split(' / ').forEach(p => {
          dictionary[p] = {
            urls: {
              'css-tricks': $(a).attr('href')
            }
          }
        })
      } else {
        dictionary[prop] = {
          urls: {
            'css-tricks': $(a).attr('href')
          }
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
  delete dictionary['--*']
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
    const prop = $(a).text()
    if (prop !== '' && !prop.includes('@')) {
      const txt = $(info).text()
      dictionary[prop] = {
        description: { html: txt, text: txt },
        urls: {
          w3schools: 'https://www.w3schools.com/cssref/' + $(a).attr('href')
        }
      }
    }
  })
  return dictionary
}

function mergeData (dict, data, type) {
  for (const prop in data) {
    if (typeof dict[prop] === 'boolean') dict[prop] = {}
    if (typeof dict[prop] !== 'object') dict[prop] = {}
    if (!Object.prototype.hasOwnProperty.call(dict[prop], 'urls')) {
      dict[prop].urls = {}
    }

    if (type === 'css-tricks') {
      dict[prop].urls['css-tricks'] = data[prop].urls['css-tricks']
    } else if (type === 'raw-mdn') {
      dict[prop].default = data[prop].default
      dict[prop].status = data[prop].status
      dict[prop].urls.mdn = data[prop].urls.mdn
    } else if (type === 'w3schools') {
      dict[prop].description = data[prop].description
      dict[prop].urls.w3schools = data[prop].urls.w3schools
    }
  }
  return dict
}

function cleanData (dict) {
  const txt = 'no information available'
  for (const prop in dict) {
    if (typeof dict[prop] === 'boolean') {
      dict[prop] = {
        property: { html: prop, text: prop },
        description: { html: txt, text: txt }
      }
    } else {
      const url = (dict[prop].urls.mdn) ? dict[prop].urls.mdn
        : (dict[prop].urls['css-tricks']) ? dict[prop].urls['css-tricks']
          : (dict[prop].urls.w3schools) ? dict[prop].urls.w3schools : undefined
      dict[prop].url = url
      dict[prop].property = {
        html: `<a href="${url}" target="_blank">${prop}</a>`,
        text: prop
      }
      if (!dict[prop].description) {
        dict[prop].description = { html: txt, text: txt }
      }
    }
  }
  return dict
}

async function scrapeCSSPropertiesNFO (destination, cb) {
  let dictionary = cmcss.propertyKeywords
  // console.log(Object.keys(dictionary).length) // 426

  const d1 = await scrapeCSSTricks(cb)
  // console.log(Object.keys(d1).length) // 181
  dictionary = mergeData(dictionary, d1, 'css-tricks')

  const d2 = await scrapeRawMDNdata(cb)
  // console.log(Object.keys(d2).length) // 362 standard (499 total)
  dictionary = mergeData(dictionary, d2, 'raw-mdn')

  const d3 = await scrapeW3Schools(cb)
  // console.log(Object.keys(d3).length) // 213
  dictionary = mergeData(dictionary, d3, 'w3schools')

  dictionary = cleanData(dictionary)
  save(dictionary, `${destination}/css-properties.json`)
}

module.exports = scrapeCSSPropertiesNFO
