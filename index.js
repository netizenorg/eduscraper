#!/usr/bin/env node

const setting = process.argv[2] || 'all'
const destination = process.argv[3] || __dirname
const scrapeHTMLAttributeNFO = require('./src/scrapeHTMLAttributeNFO.js')
const scrapeHTMLElementsNFO = require('./src/scrapeHTMLElementsNFO.js')
const scrapeCSSPropertiesNFO = require('./src/scrapeCSSPropertiesNFO.js')

if (setting === 'all' || setting === 'attributes') {
  scrapeHTMLAttributeNFO(destination, (err) => console.log('ERROR:', err))
}

if (setting === 'all' || setting === 'elements') {
  scrapeHTMLElementsNFO(destination, (err) => console.log('ERROR:', err))
}

if (setting === 'all' || setting === 'properties') {
  scrapeCSSPropertiesNFO(destination, (err) => console.log('ERROR:', err))
}
