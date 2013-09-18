# selector-detector [![NPM version](https://badge.fury.io/js/selector-detector.png)](http://badge.fury.io/js/selector-detector) [![NPM version](https://david-dm.org/okize/selector-detector.png)](https://david-dm.org/okize/selector-detector)

Counts the CSS rules, selectors and declarations on a web page as well as the total number of inline style blocks and linked stylesheets.

Internet Explorer version 9 and below have a limit on the number of CSS rules & selectors they can parse. Once it reaches that limit, it will fail silently and ignore any further CSS declarations which result in aspects of the page not having styling applied. Additionally, those versions of IE will also fail to parse any stylesheets after the 31st (inline style blocks count towards this total).

#### Internet Explorer (9 and below) Rules:

1. All style tags after the first 31 style tags are not applied.
2. All style rules after the first 4,095 rules are not applied.
3. On pages that uses the @import rule to continuously import external style sheets that import other style sheets, style sheets that are more than three levels deep are ignored.

[source](http://support.microsoft.com/kb/262161)


## Usage
```
  $ selector-detector http://www.google.com
```

## Installation

### Installing via npm (node package manager)
```
  $ [sudo] npm install -g selector-detector
```

## Clone & Hack

The source is available for download from [GitHub](https://github.com/okize/selector-detector).
```
  $ git clone git@github.com:okize/selector-detector.git && cd selector-detector
  $ npm install
```

## License

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).

[![NPM](https://nodei.co/npm/selector-detector.png)](https://nodei.co/npm/selector-detector/)
