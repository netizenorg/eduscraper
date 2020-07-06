#!/usr/bin/env node

const setting = process.argv[2] || 'all'
const destination = process.argv[3] || __dirname

const scrapeHTMLAttributeNFO = require('./src/scrapeHTMLAttributeNFO.js')
const scrapeHTMLElementsNFO = require('./src/scrapeHTMLElementsNFO.js')
const scrapeCSSPropertiesNFO = require('./src/scrapeCSSPropertiesNFO.js')
const scrapeCSSColors = require('./src/scrapeCSSColors.js')

const { save } = require('./src/utils.js')

const err = (e) => console.log('ERROR:', e)

function elements2attributes (htmlEles, htmlAttr) {
  const ele2attr = {}
  for (const ele in htmlEles) {
    ele2attr[ele] = []
    for (const attr in htmlAttr) {
      const a = htmlAttr[attr]
      const e = a.elements.text
      if (e === 'Global attribute') ele2attr[ele].push(attr)
      else {
        const els = e.split(', ').map(s => s.replace(/</g, '').replace(/>/g, ''))
        if (els.includes(ele)) ele2attr[ele].push(attr)
      }
    }
  }
  save(ele2attr, `${destination}/html-elements-to-attributes.json`)
}

async function main () {
  let htmlAttr, htmlEles

  if (setting === 'all' || setting === 'attributes') {
    htmlAttr = await scrapeHTMLAttributeNFO(destination, err)
  }

  if (setting === 'all' || setting === 'elements') {
    htmlEles = await scrapeHTMLElementsNFO(destination, err)
  }

  if (htmlAttr && htmlEles) elements2attributes(htmlEles, htmlAttr)

  if (setting === 'all' || setting === 'properties') {
    scrapeCSSPropertiesNFO(destination, err)
  }

  if (setting === 'all' || setting === 'colors') {
    scrapeCSSColors(destination, err)
  }
}

main()
