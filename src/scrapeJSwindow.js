const axios = require('axios')
const cheerio = require('cheerio')
const { save, cleanStr } = require('./utils.js')

function checkForStatus ($, ele) {
  let status = 'standard'
  for (let i = 0; i < $(ele).children().length; i++) {
    const child = $(ele).children()[i]
    const t = $(child).attr('title')
    if (t) {
      if (t.includes('obsolete') || t.includes('deprecated')) {
        status = 'obsolete'
      } else if (t.includes('experimental')) {
        status = 'experimental'
      } else if (t.includes('not been standardized')) {
        status = 'non-standard'
      }
    }
  }
  return status
}

const windowNfo = {
  status: 'standard',
  url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window',
  keyword: {
    html: '<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/Window">window</a>',
    text: 'window'
  },
  description: {
    html: 'The <strong><code>Window</code></strong> interface represents a window containing a <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Glossary/DOM">DOM</a> document; the <code>document</code> property points to the <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/Document">DOM document</a> loaded in that window.',
    text: 'The Window interface represents a window containing a DOM document; the document property points to the DOM document loaded in that window. A window for a given document can be obtained using the document.defaultView property.'
  }
}

const documentNfo = {
  status: 'standard',
  url: 'https://developer.mozilla.org/en-US/docs/Web/API/document',
  keyword: {
    html: '<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/document">document</a>',
    text: 'document'
  },
  description: {
    html: 'The <strong>Document</strong> interface represents any web page loaded in the browser and serves as an entry point into the web page\'s content, which is the <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Using_the_W3C_DOM_Level_1_Core">DOM tree</a>. The DOM tree includes elements such as <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/body"><code>&lt;body&gt;</code></a> and <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/table"><code>&lt;table&gt;</code></a>, among <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element">many others</a>. It provides functionality globally to the document, like how to obtain the page\'s URL and create new elements in the document.',
    text: 'The Document interface represents any web page loaded in the browser and serves as an entry point into the web page\'s content, which is the DOM tree. The DOM tree includes elements such as <body> and <table>, among many others. It provides functionality globally to the document, like how to obtain the page\'s URL and create new elements in the document.'
  }
}

async function scrapeJSnfo (url, file, destination, cb) {
  const res = await axios.get(url)

  const code = res.request.res.statusCode
  if (code !== 200) return cb(code)
  else if (!res.data) cb(res)

  const dictionary = {}
  const $ = cheerio.load(res.data)
  $('dt').each((i, ele) => {
    const link = $('a', ele)
    const fullName = $(link).text().replace(/\s/g, '')
    if (fullName.indexOf('Window') === 0) {
      const name = fullName.split('.')[1].split('()')[0]
      const descText = $($(ele).next()).text()
      const descHTML = cleanStr($($(ele).next()).html(), true)
      const status = checkForStatus($, ele)
      const root = 'https://developer.mozilla.org'
      const url = root + $(link).attr('href')
      if (name === 'window') dictionary[name] = windowNfo
      else if (name === 'document') dictionary[name] = documentNfo
      else {
        dictionary[name] = {
          status: status,
          url: url,
          keyword: {
            html: url ? `<a target="_blank" href="${url}">${name}</a>` : name,
            text: name
          },
          description: { html: descHTML, text: descText }
        }
      }
    }
  })
  save(dictionary, `${destination}/${file}.json`)
  return dictionary
}

module.exports = scrapeJSnfo
