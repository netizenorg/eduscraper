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

const historyNfo = {
  status: 'standard',
  url: 'https://developer.mozilla.org/en-US/docs/Web/API/History_API',
  keyword: {
    html: '<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/History_API">history</a>',
    text: 'history'
  },
  description: {
    html: 'The DOM <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/Window"><code>Window</code></a> object provides access to the browser\'s session history (not to be confused for <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/history">WebExtensions history</a>) through the <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/Window/history"><code>history</code></a> object. It exposes useful methods and properties that let you navigate back and forth through the user\'s history, and manipulate the contents of the history stack.',
    text: 'The DOM Window object provides access to the browser\'s session history (not to be confused for WebExtensions history) through the history object. It exposes useful methods and properties that let you navigate back and forth through the user\'s history, and manipulate the contents of the history stack.'
  }
}

const locationNfo = {
  status: 'standard',
  url: 'https://developer.mozilla.org/en-US/docs/Web/API/Location',
  keyword: {
    html: '<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/Location">location</a>',
    text: 'location'
  },
  description: {
    html: 'The <strong><code>Location</code></strong> interface represents the location (URL) of the object it is linked to. Changes done on it are reflected on the object it relates to. Both the <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/Document"><code>Document</code></a> and <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/Window"><code>Window</code></a> interface have such a linked <code>Location</code>, accessible via <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/Document/location"><code>Document.location</code></a> and <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/Window/location"><code>Window.location</code></a> respectively.',
    text: 'The Location interface represents the location (URL) of the object it is linked to. Changes done on it are reflected on the object it relates to. Both the Document and Window interface have such a linked Location, accessible via Document.location and Window.location respectively.'
  }
}

const navigatorNfo = {
  status: 'standard',
  url: 'https://developer.mozilla.org/en-US/docs/Web/API/Navigator',
  keyword: {
    html: '<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/Navigator">navigator</a>',
    text: 'navigator'
  },
  description: {
    html: 'The <code><strong>Navigator</strong></code> interface represents the state and the identity of the user agent. It allows scripts to query it and to register themselves to carry on some activities.',
    text: 'The Navigator interface represents the state and the identity of the user agent. It allows scripts to query it and to register themselves to carry on some activities.'
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
      else if (name === 'location') dictionary[name] = locationNfo
      else if (name === 'navigator') dictionary[name] = navigatorNfo
      else if (name === 'history') dictionary[name] = historyNfo
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
