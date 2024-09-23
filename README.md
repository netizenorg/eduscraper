# THIS REPO IS NOT LONGER BEING MAINTAINED
*(...it served its purpose)*
<br>
<br>
<br>
<br>
<br>
<br>

# eduscraper

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

web scrapers for creating web literacy info modules/files throughout other netizen projects. It stores the data in JSON files. run:  `./index.js [type] [destination]` where `[destination]` is a relative path to a directory you want to save the files into, and `[type]` can be either: attributes, elements, properties, colors, data-types, pseudo-elements, pseudo-classes, at-rules or all.

each JSON file is a "dictionary" where the keys are things like html-element names or css-property names and their values are objects that looke like:

```json
{
  "url": "[url to online reference]",
  "keyword": {
    "html": "[marked up keyword (<a>, <code>, <strong>, etc.)]",
    "text": "[keyword (attribute name, element name, etc)]"
  },
  "description": {
    "html": "[marked up description (<a>, <code>, <strong>, etc.)]",
    "text": "[just the text description, no markup]"
  }
}
```

some of the JSON files have alternative structures and others additional information specific to that content.

# Sources

## HTML NFO
- https://developer.mozilla.org/en-US/docs/Web/HTML/Element
- https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#Attribute_list
- https://www.w3schools.com/tags/ref_attributes.asp
- https://www.lifewire.com/html-singleton-tags-3468620

## CSS NFO
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference#Keyword_index
- https://github.com/mdn/data/blob/master/css/properties.json
- https://css-tricks.com/almanac/
- https://www.w3schools.com/cssref/
- https://www.w3schools.com/colors/colors_names.asp
- https://codemirror.net (specifically their "css-mode" data)
- https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Types
- https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements
- https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes

## JS NFO
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference
- https://developer.mozilla.org/en-US/docs/Web/API
