const axios = require('axios')
const cheerio = require('cheerio')
const { save, cleanStr } = require('./utils.js')

function scrapeJSRefDescription (data) {
  const $ = cheerio.load(data)
  const article = $('.main-page-content p')[0]
    ? $('.main-page-content p')[0] : $('#wikiArticle p')[0]
      ? $('#wikiArticle p')[0] : $('.seoSummary')

  const description = {
    html: cleanStr($(article).html(), true),
    text: $(article).text()
  }

  return description
}

// on plain .html page
const props = [ // Object.keys(window).join("', '")
  'close', 'stop', 'focus', 'blur', 'open', 'alert', 'confirm', 'prompt', 'print', 'postMessage', 'captureEvents', 'releaseEvents', 'getSelection', 'getComputedStyle', 'matchMedia', 'moveTo', 'moveBy', 'resizeTo', 'resizeBy', 'scroll', 'scrollTo', 'scrollBy', 'getDefaultComputedStyle', 'scrollByLines', 'scrollByPages', 'sizeToContent', 'updateCommands', 'find', 'dump', 'setResizable', 'requestIdleCallback', 'cancelIdleCallback', 'requestAnimationFrame', 'cancelAnimationFrame', 'reportError', 'btoa', 'atob', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'queueMicrotask', 'createImageBitmap', 'structuredClone', 'fetch', 'self', 'name', 'history', 'customElements', 'locationbar', 'menubar', 'personalbar', 'scrollbars', 'statusbar', 'toolbar', 'status', 'closed', 'event', 'frames', 'length', 'opener', 'parent', 'frameElement', 'navigator', 'clientInformation', 'external', 'applicationCache', 'screen', 'innerWidth', 'innerHeight', 'scrollX', 'pageXOffset', 'scrollY', 'pageYOffset', 'screenLeft', 'screenTop', 'screenX', 'screenY', 'outerWidth', 'outerHeight', 'performance', 'mozInnerScreenX', 'mozInnerScreenY', 'devicePixelRatio', 'scrollMaxX', 'scrollMaxY', 'fullScreen', 'ondevicemotion', 'ondeviceorientation', 'onabsolutedeviceorientation', 'InstallTrigger', 'visualViewport', 'crypto', 'onabort', 'onblur', 'onfocus', 'onauxclick', 'onbeforeinput', 'oncanplay', 'oncanplaythrough', 'onchange', 'onclick', 'onclose', 'oncontextmenu', 'oncuechange', 'ondblclick', 'ondrag', 'ondragend', 'ondragenter', 'ondragexit', 'ondragleave', 'ondragover', 'ondragstart', 'ondrop', 'ondurationchange', 'onemptied', 'onended', 'onformdata', 'oninput', 'oninvalid', 'onkeydown', 'onkeypress', 'onkeyup', 'onload', 'onloadeddata', 'onloadedmetadata', 'onloadstart', 'onmousedown', 'onmouseenter', 'onmouseleave', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onwheel', 'onpause', 'onplay', 'onplaying', 'onprogress', 'onratechange', 'onreset', 'onresize', 'onscroll', 'onsecuritypolicyviolation', 'onseeked', 'onseeking', 'onselect', 'onslotchange', 'onstalled', 'onsubmit', 'onsuspend', 'ontimeupdate', 'onvolumechange', 'onwaiting', 'onselectstart', 'onselectionchange', 'ontoggle', 'onpointercancel', 'onpointerdown', 'onpointerup', 'onpointermove', 'onpointerout', 'onpointerover', 'onpointerenter', 'onpointerleave', 'ongotpointercapture', 'onlostpointercapture', 'onmozfullscreenchange', 'onmozfullscreenerror', 'onanimationcancel', 'onanimationend', 'onanimationiteration', 'onanimationstart', 'ontransitioncancel', 'ontransitionend', 'ontransitionrun', 'ontransitionstart', 'onwebkitanimationend', 'onwebkitanimationiteration', 'onwebkitanimationstart', 'onwebkittransitionend', 'u2f', 'onerror', 'speechSynthesis', 'onafterprint', 'onbeforeprint', 'onbeforeunload', 'onhashchange', 'onlanguagechange', 'onmessage', 'onmessageerror', 'onoffline', 'ononline', 'onpagehide', 'onpageshow', 'onpopstate', 'onrejectionhandled', 'onstorage', 'onunhandledrejection', 'onunload', 'ongamepadconnected', 'ongamepaddisconnected', 'localStorage', 'origin', 'crossOriginIsolated', 'isSecureContext', 'indexedDB', 'caches', 'sessionStorage', 'window', 'document', 'location', 'top'
]

// on https://developer.mozilla.org/en-US/docs/Web/API/Window
const mdn = [ // [...document.querySelectorAll('dt > a > code')].map(e => e.textContent).filter(t => t.indexOf('Window') === 0).map(s => s.substr(7)).join("', '")
  'clientInformation', 'closed', 'console', 'credentialless', 'customElements', 'crypto', 'devicePixelRatio', 'document', 'event', 'external', 'frameElement', 'frames', 'fullScreen', 'history', 'innerHeight', 'innerWidth', 'length', 'location', 'locationbar', 'localStorage', 'menubar', 'messageManager', 'mozInnerScreenX', 'mozInnerScreenY', 'name', 'navigation', 'navigator', 'opener', 'outerHeight', 'outerWidth', 'pageXOffset', 'pageYOffset', 'parent', 'performance', 'personalbar', 'screen', 'screenX', 'screenLeft', 'screenY', 'screenTop', 'scrollbars', 'scrollMaxX', 'scrollMaxY', 'scrollX', 'scrollY', 'self', 'sessionStorage', 'sidebar', 'speechSynthesis', 'status', 'statusbar', 'toolbar', 'top', 'visualViewport', 'window', 'scheduler', 'content', 'defaultStatus', 'orientation', 'returnValue', 'alert', 'blur', 'cancelAnimationFrame', 'cancelIdleCallback', 'clearImmediate', 'close', 'confirm', 'dump', 'find', 'focus', 'getComputedStyle', 'getDefaultComputedStyle', 'getSelection', 'matchMedia', 'moveBy', 'moveTo', 'open', 'postMessage', 'print', 'prompt', 'queryLocalFonts', 'requestAnimationFrame', 'requestIdleCallback', 'resizeBy', 'resizeTo', 'scroll', 'scrollBy', 'scrollByLines', 'scrollByPages', 'scrollTo', 'setImmediate', 'setResizable', 'sizeToContent', 'showOpenFilePicker', 'showSaveFilePicker', 'showDirectoryPicker', 'stop', 'updateCommands', 'back', 'captureEvents', 'forward', 'home', 'releaseEvents', 'showModalDialog'
]

const filterOut = [
  'InstallTrigger', 'clientInformation', 'setResizable', 'u2f', 'ontoggle', 'ondragexit', 'onabsolutedeviceorientation', 'returnValue', 'messageManager', 'home'
]

const req = async (url) => {
  const res = await axios.get(url)
  const code = res.request.res.statusCode
  if (code !== 200) return { error: code }
  else if (!res.data) return { error: 'no data' }
  else return { data: res.data, url }
}

async function getNfo (p) {
  try {
    if (p.indexOf('on') === 0) {
      const pe = p.substr(2)
      try {
        return await req(`https://developer.mozilla.org/en-US/docs/Web/API/Window/${pe}_event`)
      } catch (err) {
        try {
          return await req(`https://developer.mozilla.org/en-US/docs/Web/API/Element/${pe}_event`)
        } catch (err) {
          try {
            return await req(`https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/${pe}_event`)
          } catch (err) {
            try {
              return await req(`https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/${pe}_event`)
            } catch (err) {
              try {
                return await req(`https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/${pe}_event`)
              } catch (err) {
                try {
                  return await req(`https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/${pe}_event`)
                } catch (err) {
                  try {
                    return await req(`https://developer.mozilla.org/en-US/docs/Web/API/Node/${pe}_event`)
                  } catch (err) {
                    try {
                      return await req(`https://developer.mozilla.org/en-US/docs/Web/API/HTMLSlotElement/${pe}_event`)
                    } catch (err) {
                      try {
                        return await req(`https://developer.mozilla.org/en-US/docs/Web/API/HTMLTrackElement/${pe}_event`)
                      } catch (err) {
                        try {
                          return await req(`https://developer.mozilla.org/en-US/docs/Web/API/Window/${pe}_event`)
                        } catch (err) {
                          try {
                            return await req(`https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/${pe}_event`)
                          } catch (err) {
                            return { error: 'axios bug' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return await req(`https://developer.mozilla.org/en-US/docs/Web/API/Window/${p}`)
  } catch (err) {
    try {
      return await req(`https://developer.mozilla.org/en-US/docs/Web/API/${p}`)
    } catch (err) {
      return { error: 'axios bug' }
    }
  }
}

async function scrapeJSnfo (url, file, destination, cb) {
  const dictionary = {}
  const both = [...props, ...mdn]
  const filtered = [...new Set(both)]
    .filter(p => p.indexOf('onmoz') !== 0)
    .filter(p => p.indexOf('onwebkit') !== 0)
    .filter(p => !filterOut.includes(p))
  filtered.forEach(async (p, i) => {
    const data = await getNfo(p)
    if (data.error) console.log(i, p, data)
    else {
      const url = data.url
      const description = scrapeJSRefDescription(data.data)
      dictionary[p] = {
        url: url,
        keyword: {
          html: `<a target="_blank" href="${url}">${p}</a>`,
          text: p
        },
        description
      }
      if (Object.keys(dictionary).length === filtered.length) {
        save(dictionary, `${destination}/${file}.json`)
        return dictionary
      } else {
        console.log(`... ${p}`)
      }
    }
  })
}

module.exports = scrapeJSnfo
