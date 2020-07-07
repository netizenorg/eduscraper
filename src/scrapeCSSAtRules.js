const axios = require('axios')
const cheerio = require('cheerio')
const { save } = require('./utils.js')

async function scrapCSSColors (destination, cb) {
  const url = 'https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule'
  const res = await axios.get(url)

  const code = res.request.res.statusCode
  if (code !== 200) return cb(code)
  else if (!res.data) cb(res)

  const dictionary = {}
  const root = 'https://developer.mozilla.org/'
  const $ = cheerio.load(res.data)
  $('#wikiArticle a').each((i, ele) => {
    const str = $(ele).text()
    if (str.indexOf('@') === 0 && !dictionary[str]) {
      const rURL = root + $(ele).attr('href')
      const desc = $(ele).attr('title')
      const std = $(ele).next()
      let status = 'standard'
      if (std && $(std).attr('title') && $(std).attr('title').includes('experimental')) {
        status = 'experimental'
      }
      dictionary[str] = {
        url: rURL,
        status: status,
        keyword: {
          html: rURL ? `<a target="_blank" href="${rURL}">${str}</a>` : str,
          text: str
        },
        description: {
          html: desc.replace(/</g, '"').replace(/>/g, '"'),
          text: desc
        }
      }
    }
  })
  save(dictionary, `${destination}/css-at-rules.json`)
  return dictionary
}

module.exports = scrapCSSColors
