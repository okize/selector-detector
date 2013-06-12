# selectorDetector

CLI tool to count the CSS rules, selectors and declarations on a web page.

Internet Explorer 9, 8, 7 & 6 have a limit on the number of rules/selectors it can parse. Once it reaches that limit, it will fail silently and ignore any further CSS declarations which result in aspects of the page not having styling applied.

#### Internet Explorer (9 and below) Rules:

1. All style tags after the first 31 style tags are not applied.
2. All style rules after the first 4,095 rules are not applied.
3. On pages that uses the @import rule to continuously import external style sheets that import other style sheets, style sheets that are more than three levels deep are ignored.

[source](http://support.microsoft.com/kb/262161)

## Installation

### Installing via npm (node package manager)
```
  $ [sudo] npm install selectorDetector
```

### Clone & Hack

The source is available for download from [GitHub](https://github.com/okize/selectorDetector).
```
  $ git clone git@github.com:okize/selectorDetector.git && cd selectorDetector
  $ npm install
```

## Usage
```
  $ selectorDetector http://www.google.com
```

## Todo:

* Allow user-agent heading flags
* Add fuzzy url arguments
* Create 'verbose' mode for increased console logging
* Create better error messaging
* Display progress indicator
* Add mocha tests