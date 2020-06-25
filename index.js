const setting = process.argv[2]
const destination = process.argv[3]
const scrapeHTMLAttributeNFO = require('./src/scrapeHTMLAttributeNFO.js')

if (setting === 'all' || setting === 'attributes') {
  scrapeHTMLAttributeNFO(destination, (err) => console.log('ERROR:', err))
}
