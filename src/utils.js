const fs = require('fs')

function save (dictionary, destination) {
  const str = JSON.stringify(dictionary, null, 2)
  fs.writeFile(destination, str, (err) => { if (err) console.log(err) })
}

function cleanStr (str, urls, brs) {
  if (urls) {
    str = str
      .replace(/href="\/en-US/g, 'href="https://developer.mozilla.org/en-US')
      .replace(/href="\/docs/g, 'href="https://developer.mozilla.org/docs')
      .replace(/href="/g, 'target="_blank" href="')
  }
  if (brs) {
    str = str
      .replace(/\n\s\s\s\s/g, '')
      .replace(/\n\s\s\s/g, '')
      .replace(/\n\s\s/g, '')
      .replace(/\n\s/g, '')
      .replace(/\n/g, '')
  }
  return str
}

function isSingleton (name) {
  // aka "void elements", HTML elements w/out a closing tag
  // src: https://www.lifewire.com/html-singleton-tags-3468620
  const singletons = [
    'area',
    'base',
    'br',
    'col',
    'command',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
  ]
  return singletons.includes(name)
}

module.exports = { save, cleanStr, isSingleton }
