const setting = process.argv[2]
const destination = process.argv[3]
const scrapeHTMLAttributeNFO = require('./src/scrapeHTMLAttributeNFO.js')
const scrapeHTMLElementsNFO = require('./src/scrapeHTMLElementsNFO.js')

if (setting === 'all' || setting === 'attributes') {
  scrapeHTMLAttributeNFO(destination, (err) => console.log('ERROR:', err))
}

if (setting === 'all' || setting === 'elements') {
  scrapeHTMLElementsNFO(destination, (err) => console.log('ERROR:', err))
}
