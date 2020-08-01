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
  let $ = cheerio.load(res.data)
  $('.standard-table > tbody > tr').each((i, ele) => {
    // { keyword, elements, depreciated, experimental, note, description }
    const data = {}
    $(ele).children().each((j, ch) => {
      if (j === 0) {
        data.keyword = {}
        data.keyword.html = cleanStr($($(ch).children()[0]).html(), true, false)
        data.keyword.text = $(ch).text().replace(/\s/g, '')
        const url = $('a', ch).attr('href')
        const rel = $('a', ch).attr('rel')
        if (rel !== 'nofollow') data.url = 'https://developer.mozilla.org/' + url
        else data.url = undefined
        data.status = 'standard'
        const icon = $(ch).children()[1]
        if (icon) {
          const t = $(icon).attr('title')
          if (t.includes('experimental')) data.status = 'experimental'
          else if (t.includes('deprecated')) data.status = 'obsolete'
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
          if (data.note.text.includes('legacy')) data.status = 'obsolete'
          if (data.note.text.includes('obsolete')) data.status = 'obsolete'
        } else data.note = null
      }
    })
    dictionary[data.keyword.text] = data
  })

  // w3schools as MDN backup...
  const r2 = await axios.get('https://www.w3schools.com/tags/ref_attributes.asp')

  const code2 = r2.request.res.statusCode
  if (code2 !== 200) return cb(code2)
  else if (!r2.data) cb(r2)

  $ = cheerio.load(r2.data)
  $('.w3-table-all > tbody > tr').each((i, ele) => {
    const prop = $('td:nth-child(1)', ele).text()
    if (dictionary[prop]) {
      const o = dictionary[prop]
      if (!o.url || o.url === 'https://developer.mozilla.org/undefined') {
        const path = $('td:nth-child(1) > a', ele).attr('href')
        if (path) o.url = `https://www.w3schools.com/tags/${path}`
      }
      if (!o.description.text) {
        const nfo = $('td:nth-child(3)', ele).text()
        o.description.text = nfo
        o.description.html = nfo
      }
    }
  })

  save(dictionary, `${destination}/html-attributes.json`)
  return dictionary
}

module.exports = scrapeHTMLAttributeNFO
