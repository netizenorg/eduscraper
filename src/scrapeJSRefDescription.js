const axios = require('axios')
const cheerio = require('cheerio')

async function scrapeJSRefDescription (url, cb) {
  const res = await axios.get(url)

  const code = res.request.res.statusCode
  if (code !== 200) return cb(code)
  else if (!res.data) cb(res)

  const $ = cheerio.load(res.data)
  const article = $('#wikiArticle > p')[0]
  const description = {
    html: $(article).html(),
    text: $(article).text()
  }
  return description
}

module.exports = scrapeJSRefDescription
