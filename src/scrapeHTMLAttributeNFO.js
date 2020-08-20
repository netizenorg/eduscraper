const axios = require('axios')
const cheerio = require('cheerio')
const { save, cleanStr } = require('./utils.js')

async function scrapeHTMLAttributeNFO (destination, cb) {
  const url = 'https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#Attribute_list'
  const res = await axios.get(url)

  const code = res.request.res.statusCode
  if (code !== 200) return cb(code)
  else if (!res.data) cb(res)

  const dictionary = {
    property: {
      keyword: {
        html: '<a href="https://ogp.me/" target="_blank">property</a>',
        text: 'property'
      },
      url: 'https://ogp.me/',
      status: 'standard',
      elements: {
        html: '<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta" title="The HTML &lt;meta&gt; element represents metadata that cannot be represented by other HTML meta-related elements, like &lt;base&gt;, &lt;link&gt;, &lt;script&gt;, &lt;style&gt; or &lt;title&gt;."><code>&lt;meta&gt;</code></a>',
        text: '<meta>'
      },
      description: {
        html: 'This property is part of the (non-standard, but widely used) "<a href="https://ogp.me/" target="_blank">open graph protocol</a>". It\'s used to specify the data social media sites should use when creating "cards" and other dynamically generated elements when users share a link to a web page.',
        text: 'This property is part of the (non-standard, but widely used) "open graph protocol". It\'s used to specify the data social media sites should use when creating "cards" and other dynamically generated elements when users share a link to a web page.'
      }
    }
  }

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
        if (path) {
          o.url = `https://www.w3schools.com/tags/${path}`
          o.keyword.html = `<a target="_blank" href="${o.url}">${prop}</a>`
        }
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
