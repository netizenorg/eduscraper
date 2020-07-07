const axios = require('axios')
const cheerio = require('cheerio')
const { save } = require('./utils.js')

async function scrapeCSSPseudo (url, file, destination, cb) {
  const res = await axios.get(url)

  const code = res.request.res.statusCode
  if (code !== 200) return cb(code)
  else if (!res.data) cb(res)

  const dictionary = {}
  const $ = cheerio.load(res.data)
  $('#index.index li').each((i, ele) => {
    const str = $('a', ele).text()
    const eid = str.indexOf('(:')
    const end = eid === -1 ? str.length : eid
    const name = $('a', ele).text().substr(0, end).replace(/\s/g, '')

    const root = 'https://developer.mozilla.org'
    let peURL = root + $('a', ele).attr('href')
    if ($('a', ele).attr('rel') === 'nofollow') peURL = null

    let status = 'standard'
    const std = $('span', ele)
    if (std && $(std).attr('title') && $(std).attr('title').includes('experimental')) {
      status = 'experimental'
    }

    dictionary[name] = {
      status: status,
      url: peURL,
      keyword: {
        html: peURL ? `<a target="_blank" href="${peURL}">${name}</a>` : name,
        text: name
      }
    }
  })
  save(dictionary, `${destination}/${file}.json`)
  return dictionary
}

module.exports = scrapeCSSPseudo
