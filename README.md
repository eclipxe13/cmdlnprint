# Firefox cmdlnprint extension

Addon for Firefox to automate printing using command line (silent printing).

You can print to a normal printer configured at your system or print as a file (pdf, ps or png).

Get it from Mozilla Addons: https://addons.mozilla.org/en-US/firefox/addon/cmdlnprint/

## Why this plugin exists?

Sometimes you need to automate the process of printing a webpage to a local
printer or create a PDF from a web application that doesn't create it by itself.

This is when cmdlnprint extension comes to help.

A good example is to create PDF files from a web application.
Sometimes the application cannot create the PDF,
sometimes you don't have time to programming the report.

I have seen other people explaining how they use this tool:
- http://cfsprinter.readthedocs.io/en/latest/browser.html
- http://forums.mozillazine.org/viewtopic.php?f=38&t=2729795
- https://eegg.wordpress.com/2010/01/17/html-to-pdf/

It would be great for firefox to support command line printing or automation printing API.

## Usage

```
firefox -print <URL>
```

## Options

- -print-mode: pdf|png|ps|postscript|html|htm|text|txt|<printer-name>, default printer
- -print-file filename: output file, use absolute paths
- -print-delay number: seconds to wait before printing, default 0
- -print-printer printer: if '' (empty string) or 'default' then will lookup for your current default printer
- -print-orientation: portrait, landscape or default
- -print-bgcolors: yes, no or default
- -print-bgimages: yes, no or default
- -print-shrinktofit: yes, no or default
- -print-header: yes or no
- -print-header-left text: text to print of header left
- -print-header-center text: text to print of header center
- -print-header-right text: text to print of header right
- -print-footer: yes or no
- -print-footer-left text: text to print of footer left
- -print-footer-center text: text to print of footer center
- -print-footer-right text: text to print of footer right
- -print-range: yes or no
- -print-range-start n: page start
- -print-range-end n: page end
- -print-paper-custom: yes or no, default no
- -print-paper-units: mm or in, default in
- -print-paper-width number: default 8.5
- -print-paper-height number: default 11
- -print-margin-top number, default 0.4
- -print-margin-right number, default 0.4
- -print-margin-bottom number, default 0.4
- -print-margin-left number, default 0.4
- -print-edge-top number, default 0
- -print-edge-right number, default 0
- -print-edge-bottom number, default 0
- -print-edge-left number, default 0

### About paper size, edges and margins

These are rules followed by the plugin that may help you when printing.
- The unwritable margins are always zero.
- The parameter print-paper-units defines the units of size, edges and margins
- The size of the paper is defined by print-paper-custom, print-paper-width and print-paper-height
  If no custom paper is defined then it uses the default
- The edges (top, right, bottom and left) define the position of the header and footer
- The margins (top, right, bottom and left) define the position of the content

### Disabling the hardware acceleration

According to issue #7 [GFX1-]: D3D11 layers just crashed; D3D11 will be disabled.
It may be helpful if you are experiencing problems to disable handware acceleration on firefox settings.

## Get information about the execution

If the option `-print-info yes` is set then it will print the options readed and also the
settings object in the console. Add also the parameter `-jsconsole`.

## Authors

* Current: Carlos C Soto https://github.com/eclipxe13
* Original: O. Atsushi https://github.com/Torisugari

I've been use this extension from O. Atsushi from several years, he had never answer an email
or take care of a pull request on github, this is why I'm taking the project and giving him the credit for
the initial release. Thanks!

Feel free to contibute to this project, we are on github!
https://github.com/eclipxe13/cmdlnprint/

## Help wanted

If you have experience creating and building firefox extensions,
could you please consider mentor me or help me maintaining this extension?

## License

MPL 1.1/GPL 2.0/LGPL 2.1 as shown in file src/chrome/license.txt
