# Firefox cmdlnprint extension (**DEPRECATED**)

Firefox remove the API required to make this plugin work, it depends on `XPCOM` but it is not available anymore
for use with extensions. There is no API on `WebExtensions` available to provide this functionality.

## Alternative

The closest alternative to produce a high quality PDF file from web content is to create the file on server
side using [`puppeteer`](https://github.com/GoogleChrome/puppeteer) and send to print from there.
I think there is also a silent printing on the client using [`printjs`](https://printjs.crabbly.com/) but I didn't try it.

I hope that in the future Firefox can expose its printing API and make it possible to create a PDF file and produce
silent printing again.

## Authors and License

- Current: Carlos C Soto <https://github.com/eclipxe13>
- Original: O. Atsushi <https://github.com/Torisugari>

MPL 1.1/GPL 2.0/LGPL 2.1 as shown in file [license.txt](license.txt)