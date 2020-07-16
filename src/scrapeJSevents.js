const axios = require('axios')
const cheerio = require('cheerio')
const { save, cleanStr } = require('./utils.js')

function checkForStatus ($, ele) {
  let status = 'standard'
  for (let i = 0; i < $(ele).children().length; i++) {
    const child = $(ele).children()[i]
    const t = $(child).attr('title')
    if (t) {
      if (t.includes('obsolete') || t.includes('deprecated')) {
        status = 'obsolete'
      } else if (t.includes('experimental')) {
        status = 'experimental'
      } else if (t.includes('not been standardized')) {
        status = 'non-standard'
      }
    }
  }
  return status
}

const except = {
  abort: {
    UIEvent: 'https://developer.mozilla.org/en-US/docs/Web/Events/abort',
    ProgressEvent: 'https://developer.mozilla.org/en-US/docs/Web/Reference/Events/abort_(ProgressEvent)'
  },
  error: {
    UIEvent: 'https://developer.mozilla.org/en-US/docs/Web/Events/error',
    ProgressEvent: 'https://developer.mozilla.org/en-US/docs/Web/Events/error',
    Event: 'https://developer.mozilla.org/en-US/docs/Web/Events/error'
  },
  ended: {
    MediaEvent: 'https://developer.mozilla.org/en-US/docs/Web/Events/ended',
    WebAudioEvent: 'https://developer.mozilla.org/en-US/docs/Web/Events/ended_(Web_Audio)'
  },
  load: {
    UIEvent: 'https://developer.mozilla.org/en-US/docs/Web/Events/load',
    ProgressEvent: 'https://developer.mozilla.org/en-US/docs/Web/Reference/Events/load_(ProgressEvent)'
  },
  message: {
    WebSocketEvent: 'https://developer.mozilla.org/en-US/docs/Web/Reference/Events/message_websocket',
    WebWorkersEvent: 'https://developer.mozilla.org/en-US/docs/Web/Reference/Events/message_webworker',
    WebMessagingEvent: 'https://developer.mozilla.org/en-US/docs/Web/Reference/Events/message_webmessaging',
    ServerSentEvent: 'https://developer.mozilla.org/en-US/docs/Web/Reference/Events/message_serversentevents'
  },
  open: {
    WebSocketEvent: 'https://developer.mozilla.org/en-US/docs/Web/Reference/Events/open_websocket',
    ServerSentEvent: 'https://developer.mozilla.org/en-US/docs/Web/Reference/Events/open_serversentevents'
  },
  pause: {
    MediaEvent: 'https://developer.mozilla.org/en-US/docs/Web/Events/pause',
    WebSpeechEvent: 'https://developer.mozilla.org/en-US/docs/Web/Events/pause_(SpeechSynthesis)'
  }
}

function createException (name) {
  const url = 'https://developer.mozilla.org/en-US/docs/Web/Events#Standard_events'
  const txt = `The ${name} event could refer to a few different type of events depending on the context, could be the `
  let text = txt
  let html = txt
  for (const key in except[name]) {
    html += `<a href="${except[name][key]}" target="_blank">${key}</a>, `
    text += key + ', '
  }
  text = text.substr(0, text.length - 2)
  html = html.substr(0, html.length - 2)
  return {
    status: 'standard',
    url: url,
    keyword: {
      html: `<a target="_blank" href="${url}">${name}</a>`,
      text: name
    },
    description: { html: html, text: text }
  }
}

async function scrapeJSnfo (url, file, destination, cb) {
  const res = await axios.get(url)

  const code = res.request.res.statusCode
  if (code !== 200) return cb(code)
  else if (!res.data) cb(res)

  const dictionary = {}
  const $ = cheerio.load(res.data)
  const std = $('#Standard_events')
  const nfo = $(std).next()
  const div = $(nfo).next()
  $('tr', div).each((i, ele) => {
    const row = $('td', ele)
    const name = $(row[0]).text()

    if (name === 'Event Name' || !name) return
    else if (except[name]) {
      dictionary[name] = createException(name)
      return
    }

    const root = 'https://developer.mozilla.org'
    const url = ($('a', row[0]).attr('href') && $('a', row[0]).attr('rel') !== 'nofollow')
      ? root + $('a', row[0]).attr('href') : null
    const type = {
      name: $(row[1]).text(),
      url: root + $('a', row[1]).attr('href')
    }
    const spec = {
      name: $(row[2]).text(),
      url: root + $('a', row[2]).attr('href')
    }

    let status = checkForStatus($, row[0])
    if (status === 'standard') status = checkForStatus($, row[1])

    dictionary[name] = {
      status: status,
      url: url,
      type: type,
      spec: spec,
      keyword: {
        html: url ? `<a target="_blank" href="${url}">${name}</a>` : name,
        text: name
      }
    }
  })
  save(dictionary, `${destination}/${file}.json`)
  return dictionary
}

module.exports = scrapeJSnfo
