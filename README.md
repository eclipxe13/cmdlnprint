# cmdlnprint

Addon for Firefox to print a webpage using command line.

## Why this plugin exists?

Sometimes you need to automate the process of print a webpage to a local
printer or create a PDF from a web application that doesn't create it.
This is when cmdlnprint comes useful.

A good example is to create PDF files from a web application.
Sometimes the application cannot create the PDF,
sometimes you don't have time to programming the report.

This is printing using the print command dialog.
And it's different than other approachs.
By example there are projects based on PHP or Webkit+QT that create a
PDF from a HTML file, but they doesn't implement HTML4 in the right way
(correct use of THEAD and TFOOT, by example).
And Firefox works in this escenarios like a charm.

## Create the XPI

```bash
cd src/
make clean build install
```

## Usage

```
firefox -print <URL> -printfile out.pdf
```

## Options

- -printmode ?
- -printfile filename: output file
- -printdelay n: seconds to wait before printing
- -printprinter printer: printer name
- -printorientation: portrait, landscape or default
- -printbgcolors: yes, no or default
- -printbgimages: yes, no or default
- -printshrinktofit: yes, no or default
- -printsetupheader: yes or no
- -printheaderleft text: text to print of header left
- -printheadercenter text: text to print of header center
- -printheaderright text: text to print of header right
- -printsetupfooter: yes or no
- -printfooterleft text: text to print of footer left
- -printfootercenter text: text to print of footer center
- -printfooterright text: text to print of footer right
- -printpagerange: yes or no
- -printrangestart n: page start
- -printrangeend n: page end
- -custompaper: yes or no
- -custompaperunits: mm or in
- -custompaperwidth number: default 215.9
- -custompaperheight number: default 279.4
- -margintop number, <number>
- -marginright number, <number>
- -marginbottom number, <number>
- -marginleft number, <number>

## Authors
* Original: O. Atsushi https://github.com/Torisugari
* Contributors: Carlos C Soto https://github.com/eclipxe13

## License
MPL 1.1/GPL 2.0/LGPL 2.1 as shown in file src/chrome/license.txt
