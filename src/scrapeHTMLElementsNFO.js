const axios = require('axios')
const cheerio = require('cheerio')
const { save, cleanStr, isSingleton } = require('./utils.js')
// MDN no longer labeling tags individually, this is a manually scraped list onn 12/28/2020
const obsolete = require('./data/html-obsolete-tags.json')
const flow = require('./data/block-v-inline-elements.json')

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
    // const warning = $(ele).parent().parent().prev().hasClass('warning')
    // if (warning) data.status = 'obsolete'
    // else data.status = 'standard'
    $(ele).children().each((j, ch) => {
      if (j === 0) {
        data.keyword = {}
        const url = $($(ch).children()[0]).attr('href')
        data.url = 'https://developer.mozilla.org' + url
        data.keyword.html = cleanStr($(ch).html(), true, false)
        data.keyword.text = $(ch).text()
        data.keyword.name = $(ch).text().replace(/[<>]/g, '')
        if (obsolete.includes($(ch).text())) data.status = 'obsolete'
        else data.status = 'standard'
      } else if (j === 1) {
        data.description = {}
        data.description.html = cleanStr($(ch).html(), true, false)
        data.description.text = $(ch).text()
      }
    })

    data.singleton = isSingleton(data.keyword.name)
    if (flow.inline.includes(data.keyword.text)) data.flow = 'inline'
    else if (flow.block.includes(data.keyword.text)) data.flow = 'block'

    const hs = 'h1, h2, h3, h4, h5, h6'
    if (data.keyword.name === hs) {
      hs.split(',').forEach(h => { dictionary[h.replace(/\s/g, '')] = data })
    } else {
      dictionary[data.keyword.name] = data
    }
  })

  save(dictionary, `${destination}/html-elements.json`)
  return dictionary
}

module.exports = scrapeHTMLElementsNFO
