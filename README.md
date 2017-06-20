# Firefox cmdlnprint extension

[![Release](https://img.shields.io/github/release/eclipxe13/cmdlnprint.svg)](https://github.com/eclipxe13/cmdlnprint/releases)
[![Build](https://img.shields.io/travis/eclipxe13/cmdlnprint/master.svg)](https://travis-ci.org/eclipxe13/cmdlnprint/branches)
[![Mozilla Add-on Users](https://img.shields.io/amo/users/cmdlnprint.svg)](https://addons.mozilla.org/es/firefox/addon/cmdlnprint/)
[![Mozilla Add-on Downloads](https://img.shields.io/amo/d/cmdlnprint.svg)](https://addons.mozilla.org/es/firefox/addon/cmdlnprint/)

Addon for Firefox to automate printing using command line (silent printing).
You can print to a normal printer configured at your system or print as a file (pdf, ps or png).
Get it from Mozilla Addons: <https://addons.mozilla.org/en-US/firefox/addon/cmdlnprint/>

## Compatibility

I'ḿ trying to use only Firefox ESR (Extended Support Release).

Tested on travis-ci: 38.0.1esr, 45.9.0esr, 52.0esr, 52.0.1esr, 52.0.2esr,
52.1.0esr, 52.1.1esr, 52.1.2esr & 52.2.0esr.

### Why this extension is going to die:

Starting from Firefox 57, WebExtensions will be the only supported extension type.
Desktop Firefox and Firefox for Android will not load other extension types.

Thanks god we have docker, so we will have this option even when firefox gets
updated and new versions does not allow this extension.

### Alternatives:

You **must** try: https://github.com/marcopiraccini/electron-printer

The electron-printer solution is based of electron (aka chromium for desktop),
it does not make the same results as firefox + cmdlnprint and it has a lower set
of parameters. But is a reasonable headless option with good results.

Based on electron-printer is [Athena](http://www.athenapdf.com/)
Drop-in replacement for wkhtmltopdf using Docker, Electron and Go.

## Why this plugin exists?

Sometimes you need to automate the process of printing a webpage to a local
printer or create a PDF from a web application that doesn't create it by itself.

This is when cmdlnprint extension comes to help.

A good example is to create PDF files from a web application.
Sometimes the application cannot create the PDF,
sometimes you don't have time to programming the report.

I have seen other people explaining how they use this tool:

- <http://cfsprinter.readthedocs.io/en/latest/browser.html>
- <http://forums.mozillazine.org/viewtopic.php?f=38&t=2729795>
- <https://eegg.wordpress.com/2010/01/17/html-to-pdf/>

It would be great for firefox to support command line printing or automation printing API.

## Usage

```
firefox -print <URL>
```

## Options

- `-print-mode [mode]`: pdf|png|ps|postscript|html|htm|text|txt|<printer-name>, default printer
- `-print-file filename`: output file, relative or absolute
- `-print-delay number`: seconds to wait before printing, default 0
- `-print-printer printer`: if '' (empty string) or 'default' then will lookup for your current default printer
- `-print-orientation [yes/no/default]`: portrait, landscape or default
- `-print-bgcolors [yes/no/default]`: yes, no or default
- `-print-bgimages [yes/no/default]`: yes, no or default
- `-print-shrinktofit [yes/no/default]`: yes, no or default
- `-print-header [yes/no]`: yes or no, default to "no"
    - `-print-header-left text`: text to print of header left, default to 'user_pref'
    - `-print-header-center text`: text to print of header center, default to 'user_pref'
    - `-print-header-right text`: text to print of header right, default to 'user_pref'
- `-print-footer [yes/no]`: yes or no, default to "no"
    - `-print-footer-left text`: text to print of footer left, default to 'user_pref'
    - `-print-footer-center text`: text to print of footer center, default to 'user_pref'
    - `-print-footer-right text`: text to print of footer right, default to 'user_pref'
- `-print-range [yes/no]`: define if the following parameters will be used
    - `-print-range-start number`: page start
    - `-print-range-end number`: page end
- `-print-paper-units [mm/in]`: mm for millimeters or in for inches, default mm
- `-print-paper-custom [yes/no]`: yes or no, default no
- `-print-paper-width number`: default 215.9
- `-print-paper-height number`: default 279.4
- `-print-margin-top number`: default 10
- `-print-margin-right number`: default 10
- `-print-margin-bottom number`: default 10
- `-print-margin-left number`: default 10
- `-print-edge-top number`: default 0
- `-print-edge-right number`: default 0
- `-print-edge-bottom number`: default 0
- `-print-edge-left number`: default 0
- `-print-resolution number`: default 0, used when `-print-mode printer`, pdf creation doesn't honor this parameter
- `-print-scaling number`: default 1.0 (100%), require `-print-shrinktofit no`
- `-print-margins top,right,bottom,left`: set margins at once, default to nothing
- `-print-edges top,right,bottom,left`: set edges at once, default to nothing

#### Options that uses yes/no values

For no you can set: 0, off, n. For yes you can set 1, on, y.
This are the same: `-print-header yes`, `-print-header y`, `-print-header on` or `-print-header 1`.

### About header and footer

The default value for `-print-header` and `-print-footer` is `"no"`.
The only way to specify that you want a header or footer is to set the parameter
 to a possitive value 'yes', 'y', '1', 'on'

The default value for `-print-[header,footer]-[left,center,right]` is `"user_pref"`.
When one of this parameters is equal to `"user_pref"` the plugin will simply use the
user defined value. Otherwise, it will print the string defined in the parameter.

Remember that you can use some special keywords in header and footer sections:

- `&U` Page address (URL)
- `&D` Date and time
- `&T` Page title
- `&P` Page number
- `&PT` Page number with total (Example: "3 of 5")
- `&&` A single ampersand (&)

#### Examples of header and footer

- `firefox -print http://example.org`
  will not print any header or footer
- `firefox -print http://example.org -print-header yes`
  will take all the defaults for header but will not produce any footer
- `firefox -print http://example.org -print-header yes -print-header-center '' -print-header-right '2017-03-01'`
  will print header, header left will be the user preference,
  header center will be an empty string, header right will be the date 2017-03-01, will not print any footer.
- `firefox -print http://example.org -print-header-center "my custom title"`
  will not print any header or footer,
  even when `-print-header-center` was set because `-print-header yes` was not set.

### About paper size, edges and margins

These are rules followed by the plugin that may help you when printing.

- The unwritable margins are always zero.
- The parameter print-paper-units defines the units of size, edges and margins
- The size of the paper is defined by print-paper-custom, print-paper-width and print-paper-height
  If no custom paper is defined then it uses the user preference
- The edges (top, right, bottom and left) define the position of the header and footer
- The margins (top, right, bottom and left) define the position of the content

You can set the margins and edges at once, by example:

- `-print-margins 10`: set all margins to 10
- `-print-margins 10,20`: set margins top and bottom to 10, right and left to 20
- `-print-margins 10,20,30`: set margins top to 10, right and left to 20, bottom to 30
- `-print-margins 10,20,30,40`: set margins top to 10, right to 20, bottom to 30 and left to 40

If you set `-print-margins` or `-print-edges` then the specific options (like `-print-margin-top`) are overriden.

### Disabling the hardware acceleration

According to issue #7 [GFX1-]: D3D11 layers just crashed; D3D11 will be disabled.
It may be helpful if you are experiencing problems to disable handware acceleration on firefox settings.

## Get information about the execution

If the option `-print-info` is set then it will print the options readed and also the
settings object in the console when printing or creating pdf. You should also the parameter `-jsconsole`.

## Authors

* Current: Carlos C Soto <https://github.com/eclipxe13>
* Original: O. Atsushi <https://github.com/Torisugari>

I've been use this extension from O. Atsushi from several years, he had never answer an email
or take care of a pull request on github, this is why I'm taking the project and giving him the credit for
the initial release. Thanks!

Feel free to contibute to this project, we are on github!
<https://github.com/eclipxe13/cmdlnprint/>

## Help wanted

If you have experience creating and building firefox extensions,
could you please consider mentor me or help me maintaining this extension?

## License

MPL 1.1/GPL 2.0/LGPL 2.1 as shown in file
[src/chrome/license.txt](https://raw.githubusercontent.com/eclipxe13/cmdlnprint/master/src/chrome/license.txt)
