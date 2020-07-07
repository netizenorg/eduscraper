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
  }
  save(cssPseudo, `${destination}/${file}.json`)
}

async function main () {
  let htmlAttr, htmlEles
  let cssPseudoEles, cssPseudoClasses

  if (setting === 'all' || setting === 'attributes') {
    htmlAttr = await scrapeHTMLAttributeNFO(destination, err)
    console.log('completed: html-attributes.json')
  }

  if (setting === 'all' || setting === 'elements') {
    htmlEles = await scrapeHTMLElementsNFO(destination, err)
    if (htmlAttr && htmlEles) elements2attributes(htmlEles, htmlAttr)
    console.log('completed: html-elements.json')
  }

  if (setting === 'all' || setting === 'properties') {
    scrapeCSSPropertiesNFO(destination, err)
    console.log('completed: properties')
  }

  if (setting === 'all' || setting === 'colors') {
    scrapeCSSColors(destination, err)
    console.log('completed: css-colors.json')
  }

  if (setting === 'all' || setting === 'data-types') {
    scrapeCSSDataTypes(destination, err)
    console.log('completed: css-data-types.json')
  }

  if (setting === 'all' || setting === 'at-rules') {
    scrapeCSSAtRules(destination, err)
    console.log('completed: css-at-rules.json')
  }

  if (setting === 'all' || setting === 'pseudo-elements') {
    const url = 'https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements'
    cssPseudoEles = await scrapeCSSPseudo(url, 'css-pseudo-elements', destination, err)
    addPseudoDescriptions(cssPseudoEles, 'css-pseudo-elements')
    console.log('completed: css-pseudo-elements.json')
  }

  if (setting === 'all' || setting === 'pseudo-classes') {
    const url = 'https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes'
    cssPseudoClasses = await scrapeCSSPseudo(url, 'css-pseudo-classes', destination, err)
    addPseudoDescriptions(cssPseudoClasses, 'css-pseudo-classes')
    console.log('completed: css-pseudo-classes.json')
  }
}

main()
