#!/usr/bin/env node

const setting = process.argv[2] || 'all'
const destination = process.argv[3] || __dirname

const scrapeHTMLAttributeNFO = require('./src/scrapeHTMLAttributeNFO.js')
const scrapeHTMLElementsNFO = require('./src/scrapeHTMLElementsNFO.js')
const scrapeCSSPropertiesNFO = require('./src/scrapeCSSPropertiesNFO.js')
const scrapeCSSColors = require('./src/scrapeCSSColors.js')
const scrapeCSSPseudo = require('./src/scrapeCSSPseudo.js')
const pseudoDesc = require('./src/scrapeCSSPseudoDescriptions.js')
const scrapeCSSDataTypes = require('./src/scrapeCSSDataTypes.js')
const scrapeCSSAtRules = require('./src/scrapeCSSAtRules.js')
const scrapeJSRefs = require('./src/scrapeJSRefs.js')
const jsRefDesc = require('./src/scrapeJSRefDescription.js')
const scrapeJSwindow = require('./src/scrapeJSwindow.js')
const scrapeJSdocument = require('./src/scrapeJSdocument.js')
const scrapeJShistory = require('./src/scrapeJShistory.js')
const scrapeJSlocation = require('./src/scrapeJSlocation.js')
const scrapeJSnavigator = require('./src/scrapeJSnavigator.js')
const scrapeJSmath = require('./src/scrapeJSmath.js')
const scrapeJSdate = require('./src/scrapeJSdate.js')
const scrapeJSstring = require('./src/scrapeJSstring.js')
const scrapeJSnumber = require('./src/scrapeJSnumber.js')
const scrapeJSDOMnode = require('./src/scrapeJSDOMnode.js')
const scrapeJSevents = require('./src/scrapeJSevents.js')
const scrapeJSarrays = require('./src/scrapeJSarrays.js')

const { save } = require('./src/utils.js')

const err = (e) => console.log('ERROR:', e)

function elements2attributes (htmlEles, htmlAttr) {
  for (const ele in htmlEles) {
    htmlEles[ele].attributes = []
    for (const attr in htmlAttr) {
      const a = htmlAttr[attr]
      const e = a.elements.text
      if (e === 'Global attribute') htmlEles[ele].attributes.push(attr)
      else {
        const els = e.split(', ').map(s => s.replace(/</g, '').replace(/>/g, ''))
        if (els.includes(ele))htmlEles[ele].attributes.push(attr)
      }
    }
  }
  save(htmlEles, `${destination}/html-elements.json`)
}

async function addPseudoDescriptions (cssPseudo, file) {
  for (const pe in cssPseudo) {
    if (cssPseudo[pe].url) {
      const desc = await pseudoDesc(cssPseudo[pe].url, err)
      cssPseudo[pe].description = desc
    } else {
      cssPseudo[pe].description = { html: null, text: null }
    }
    console.log('...', pe)
  }
  save(cssPseudo, `${destination}/${file}.json`)
}

async function scrapeJSRefDescription (jsRefs, file) {
  for (const jsr in jsRefs) { // events...
    if (jsRefs[jsr] instanceof Array) {
      for (let i = 0; i < jsRefs[jsr].length; i++) {
        if (!jsRefs[jsr][i].description) {
          if (jsRefs[jsr][i].url) {
            const desc = await jsRefDesc(jsRefs[jsr][i].url, err)
            jsRefs[jsr][i].description = desc
          } else {
            jsRefs[jsr][i].description = { html: null, text: null }
          }
        }
      }
    } else { // refs...
      if (!jsRefs[jsr].description) {
        if (jsRefs[jsr].url) {
          const desc = await jsRefDesc(jsRefs[jsr].url, err)
          jsRefs[jsr].description = desc
        } else {
          jsRefs[jsr].description = { html: null, text: null }
        }
      }
    }
    console.log('...', jsr)
  }
  save(jsRefs, `${destination}/${file}.json`)
}

async function main () {
  let htmlAttr, htmlEles
  let cssPseudoEles, cssPseudoClasses, jsRefs, jsEvents

  // HTML

  if (setting === 'all' || setting === 'html' || setting === 'attributes') {
    htmlAttr = await scrapeHTMLAttributeNFO(destination, err)
    console.log('completed: html-attributes.json')
  }

  if (setting === 'all' || setting === 'html' || setting === 'elements') {
    htmlEles = await scrapeHTMLElementsNFO(destination, err)
    if (htmlAttr && htmlEles) elements2attributes(htmlEles, htmlAttr)
    console.log('completed: html-elements.json')
  }

  // CSS

  if (setting === 'all' || setting === 'css' || setting === 'properties') {
    scrapeCSSPropertiesNFO(destination, err)
    console.log('completed: properties')
  }

  if (setting === 'all' || setting === 'css' || setting === 'colors') {
    scrapeCSSColors(destination, err)
    console.log('completed: css-colors.json')
  }

  if (setting === 'all' || setting === 'css' || setting === 'data-types') {
    scrapeCSSDataTypes(destination, err)
    console.log('completed: css-data-types.json')
  }

  if (setting === 'all' || setting === 'css' || setting === 'at-rules') {
    scrapeCSSAtRules(destination, err)
    console.log('completed: css-at-rules.json')
  }

  if (setting === 'all' || setting === 'css' || setting === 'pseudo-elements') {
    const url = 'https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements'
    cssPseudoEles = await scrapeCSSPseudo(url, 'css-pseudo-elements', destination, err)
    addPseudoDescriptions(cssPseudoEles, 'css-pseudo-elements')
    console.log('completed: css-pseudo-elements.json')
  }

  if (setting === 'all' || setting === 'css' || setting === 'pseudo-classes') {
    const url = 'https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes'
    cssPseudoClasses = await scrapeCSSPseudo(url, 'css-pseudo-classes', destination, err)
    addPseudoDescriptions(cssPseudoClasses, 'css-pseudo-classes')
    console.log('completed: css-pseudo-classes.json')
  }

  // JS

  if (setting === 'all' || setting === 'js' || setting === 'js-refs') {
    const url = 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference'
    jsRefs = await scrapeJSRefs(url, 'js-refs', destination, err)
    scrapeJSRefDescription(jsRefs, 'js-refs')
    console.log('completed: js-refs.json')
  }

  if (setting === 'all' || setting === 'js' || setting === 'js-window') {
    const url = 'https://developer.mozilla.org/en-US/docs/Web/API/Window'
    scrapeJSwindow(url, 'js-window', destination, err)
    console.log('completed: js-window.json')
  }

  if (setting === 'all' || setting === 'js' || setting === 'js-document') {
    const url = 'https://developer.mozilla.org/en-US/docs/Web/API/document'
    scrapeJSdocument(url, 'js-document', destination, err)
    console.log('completed: js-document.json')
  }

  if (setting === 'all' || setting === 'js' || setting === 'js-history') {
    const url = 'https://developer.mozilla.org/en-US/docs/Web/API/history'
    scrapeJShistory(url, 'js-history', destination, err)
    console.log('completed: js-history.json')
  }

  if (setting === 'all' || setting === 'js' || setting === 'js-location') {
    const url = 'https://developer.mozilla.org/en-US/docs/Web/API/location'
    scrapeJSlocation(url, 'js-location', destination, err)
    console.log('completed: js-location.json')
  }

  if (setting === 'all' || setting === 'js' || setting === 'js-navigator') {
    const url = 'https://developer.mozilla.org/en-US/docs/Web/API/navigator'
    scrapeJSnavigator(url, 'js-navigator', destination, err)
    console.log('completed: js-navigator.json')
  }

  if (setting === 'all' || setting === 'js' || setting === 'js-math') {
    const url = 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math'
    scrapeJSmath(url, 'js-math', destination, err)
    console.log('completed: js-math.json')
  }

  if (setting === 'all' || setting === 'js' || setting === 'js-date') {
    const url = 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date'
    scrapeJSdate(url, 'js-date', destination, err)
    console.log('completed: js-date.json')
  }

  if (setting === 'all' || setting === 'js' || setting === 'js-string') {
    const url = 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String'
    scrapeJSstring(url, 'js-string', destination, err)
    console.log('completed: js-string.json')
  }

  if (setting === 'all' || setting === 'js' || setting === 'js-number') {
    const url = 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number'
    scrapeJSnumber(url, 'js-number', destination, err)
    console.log('completed: js-number.json')
  }

  if (setting === 'all' || setting === 'js' || setting === 'js-dom-node') {
    const url = 'https://developer.mozilla.org/en-US/docs/Web/API/Node'
    scrapeJSDOMnode(url, 'js-dom-node', destination, err)
    console.log('completed: js-dom-node.json')
  }

  if (setting === 'all' || setting === 'js' || setting === 'js-dom-element') {
    const url = 'https://developer.mozilla.org/en-US/docs/Web/API/Element'
    scrapeJSDOMnode(url, 'js-dom-element', destination, err)
    console.log('completed: js-dom-element.json')
  }

  if (setting === 'all' || setting === 'js' || setting === 'js-dom-event-target') {
    const url = 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget'
    scrapeJSDOMnode(url, 'js-dom-event-target', destination, err)
    console.log('completed: js-dom-event-target.json')
  }

  if (setting === 'all' || setting === 'js' || setting === 'js-dom-media') {
    const url = 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement'
    scrapeJSDOMnode(url, 'js-dom-media', destination, err)
    console.log('completed: js-dom-media.json')
  }

  if (setting === 'all' || setting === 'js' || setting === 'js-dom-canvas') {
    const url = 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement'
    scrapeJSDOMnode(url, 'js-dom-canvas', destination, err)
    console.log('completed: js-dom-canvas.json')
  }

  if (setting === 'all' || setting === 'js' || setting === 'js-canvas2d') {
    const url = 'https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D'
    scrapeJSDOMnode(url, 'js-canvas2d', destination, err)
    console.log('completed: js-canvas2d.json')
  }

  if (setting === 'all' || setting === 'js' || setting === 'js-events') {
    const url = 'https://developer.mozilla.org/en-US/docs/Web/Events#Standard_events'
    jsEvents = await scrapeJSevents(url, 'js-events', destination, err)
    scrapeJSRefDescription(jsEvents, 'js-events')
    console.log('completed: js-events.json')
  }

  if (setting === 'all' || setting === 'js' || setting === 'js-arrays') {
    const url = 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array'
    scrapeJSarrays(url, 'js-arrays', destination, err)
    console.log('completed: js-arrays.json')
  }
}

main()
