const axios = require('axios')
const cheerio = require('cheerio')
const { save } = require('./utils.js')

const ignore = [
  ' ',
  'Block',
  'Empty',
  'for each...in',
  'for await...of',
  'Property accessors',
  '++A',
  '--A',
  '[a, b] = [1, 2]',
  '{a, b} = {a:1, b:2}'
]

const translate = {
  '...obj': '...',
  'async function': 'async',
  'for...in': 'in',
  'for...of': 'of',
  '/ab+c/i': 'regex',
  'A++': '++',
  'A--': '--',
  '(condition ? ifTrue : ifFalse)': '?'
}

const brackets = ['[]', '{}', '( )']

const switchURL = {
  '...': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax',
  '++': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Increment',
  '--': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Decrement',
  typeof: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof',
  '+': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Addition',
  '-': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Subtraction',
  '~': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_NOT',
  '!': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_NOT',
  '/': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Division',
  '*': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Multiplication',
  '%': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder',
  instanceof: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof',
  '<': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than',
  '>': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Greater_than',
  '<=': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than_or_equal',
  '>=': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Greater_than_or_equal',
  '==': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality',
  '!=': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Inequality',
  '===': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality',
  '!==': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_inequality',
  '<<': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Left_shift',
  '>>': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Right_shift',
  '>>>': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Unsigned_right_shift',
  '&': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_AND',
  '|': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_OR',
  '^': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_XOR',
  '&&': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND',
  '||': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR',
  '?': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator',
  '=': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Assignment',
  '*=': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Multiplication_assignment',
  '/=': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Division_assignment',
  '%=': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder_assignment',
  '+=': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Addition_assignment',
  '-=': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Subtraction_assignment',
  '<<=': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Left_shift_assignment',
  '>>=': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Right_shift_assignment',
  '>>>=': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Unsigned_right_shift_assignment',
  '&=': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_AND_assignment',
  '^=': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_XOR_assignment',
  '|=': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_OR_assignment',
  '**': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Exponentiation'
}

async function scrapeJSRefs (url, file, destination, cb) {
  const res = await axios.get(url)

  const code = res.request.res.statusCode
  if (code !== 200) return cb(code)
  else if (!res.data) cb(res)

  const dictionary = {}
  const $ = cheerio.load(res.data)
  $('.card-grid li a').each((i, ele) => {
    const root = 'https://developer.mozilla.org'
    let url = root + $(ele).attr('href')
    let name = $(ele).text()

    let alias
    if (translate[name]) {
      name = translate[name]
    } else if (name.includes('...') && !ignore.includes(name)) {
      const arr = name.split('...')
      name = arr[0]
      alias = arr[1]
    } else if (brackets.includes(name)) {
      if (name === '[]') {
        name = '['; alias = ']'
      } else if (name === '{}') {
        name = '{'; alias = '}'
      } else if (name === '( )') {
        name = '('; alias = ')'
      }
    }

    let print
    if (name !== '(' && name.includes('(')) {
      name = name.substr(0, name.indexOf('('))
      print = name + '()'
    }

    if (switchURL[name]) url = switchURL[name]

    if (!ignore.includes(name)) {
      dictionary[name] = {
        status: 'standard',
        url: url,
        keyword: {
          html: url
            ? `<a target="_blank" href="${url}">${print || name}</a>`
            : print || name,
          text: print || name
        }
      }
    }

    if (alias) dictionary[alias] = dictionary[name]
  })
  save(dictionary, `${destination}/${file}.json`)
  return dictionary
}

module.exports = scrapeJSRefs
