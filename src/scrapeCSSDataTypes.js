const axios = require('axios')
const cheerio = require('cheerio')
const { save } = require('./utils.js')

async function scrapeCSSDataTypes (destination, cb) {
  const url = 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Types'
  const res = await axios.get(url)

  const code = res.request.res.statusCode
  if (code !== 200) return cb(code)
  else if (!res.data) cb(res)

  const dictionary = {}
  const $ = cheerio.load(res.data)
  $('#wikiArticle .index li').each((i, ele) => {
    const str = $('a', ele).text()
    const name = $('a', ele).text().substr(1, str.length - 2)
    const desc = $('a', ele).attr('title')

    const root = 'https://developer.mozilla.org'
    let ctURL = root + $('a', ele).attr('href')
    if ($('a', ele).attr('rel') === 'nofollow') ctURL = null

    dictionary[name] = {
      url: ctURL,
      keyword: {
        html: ctURL ? `<a target="_blank" href="${ctURL}">${name}</a>` : name,
        text: name
      },
      description: {
        html: desc.replace(/</g, '"').replace(/>/g, '"'),
        text: desc
      }
    }
  })
  save(dictionary, `${destination}/css-data-types.json`)
  return dictionary
}

module.exports = scrapeCSSDataTypes
