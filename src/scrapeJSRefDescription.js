const axios = require('axios')
const cheerio = require('cheerio')
const { cleanStr } = require('./utils.js')

async function scrapeJSRefDescription (url, cb) {
  const res = await axios.get(url)

  const code = res.request.res.statusCode
  if (code !== 200) return cb(code)
  else if (!res.data) cb(res)

  const $ = cheerio.load(res.data)
  const article = $('.main-page-content p')[0]
    ? $('.main-page-content p')[0] : $('#wikiArticle p')[0]
      ? $('#wikiArticle p')[0] : $('.seoSummary')

  const description = {
    html: cleanStr($(article).html(), true),
    text: $(article).text()
  }

  return description
}

module.exports = scrapeJSRefDescription
