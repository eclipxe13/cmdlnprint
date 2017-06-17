# 1.1.2
- Change to maximum version 55
- Add .eslintrc.json and .eslintignore and fix code style using eslint
- Remove error on mininav.js delayedShutdown
- Change var declarations to let and const
- Update travis to extract and compare to plain text

# version 1.1.1
- From now on, the version will be:
    Major: change in backward compatibility
    Minor: change in plugin (require publish on Mozilla Addons)
    Revision: change that don't require publish on Mozilla Addons but in github master branch
- Introduced docker folder from @bdurrow (thanks!)
- Change docker/Dockerfile to build using Makefile location and rules
- Change javascript files for more readability

# version 1.0.6
- Fix units, margin and edges documentation
- Remove const Components.classes and Components.interfaces due mozilla warnings
- Use jpm --addon-dir src/ in travis
- Remove unnecessary .jpmignore file
- Move Makefile to root to not be included in xpi, use --addon-dir src/ and improve build
- Rename src/tests to src/test to not be included in xpi
- Do not use Components.utils globally at bootstrap.js and mininav.js
- No need to set cmdlnprint in bootstrap.js shutdown
- No need to import Services in bootstrap.js
- Enable multiprocess in package.json

# version 1.0.5
- Fix -print-file argument handling
    - On linux was not accepting relative paths, now it does
    - It was causing an error to print to printer directly
- Add -print-scaling as a float value, if non set it uses 1.0 (100%)
- Add -print-resolution resolution
    - resolution is an integer value, is non set is uses zero that means no change.
    - resolution is not used on pdf files by firefox, only print to real printer
- Add -print-margins to setup in one single parameter top, right, bottom and left margins
- Add -print-edges to setup in one single parameter top, right, bottom and left edges
- Modify parameter -print-info, now it does not use an argument
- Register the logo in the skin to display in the extensions list
- Remove unused defaults/preferences/cmdlnprintSettings.js file
- Change components/cmdlnprint.js to use the example from
  <https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Providing_Command-Line_Options>
  It will help to test and move the plugin to avoid restarts
- Add Travis CI platform (thanks to @bdurrow)
- Build now depends on jpm and package.json
- Added a simple bootstrap to handle command line, no need to restart
- Change components/cmdlnprint.js to a importable module
- Change minimal version to 38.0a1 as default by jpm

# version 1.0.4
- Use the user preferences for header and footers when printing and not defining the parameter.
  Improve issue #8 Header and Footer options don't appear to do anything.
- Allow parameter value on/off as yes/no
- Improve README.md:
    - Add section for header and footer
    - Add section for options that uses yes/no values
    - Improve parameters list
    - Fix license link

# version 1.0.3
- Add parameters -print-edge-top, -print-edge-right, -print-edge-bottom, -print-edge-left
  This must fix issue
- Use -printer-paper-unit to set margins and edges
- Add parameter -print-info [yes/no], useful only if -jsonsole is set
- Upgrade max version to Firefox 53.*
- Disable compatibility with macos since Firefox printing interfaces are not impllemented
- Refactory of saveCanvas, fix issue #4 and this may be fixing the issue #6
- Fix bug where -print-paper-units were not read properly
- change version to 1.0.3

# version 1.0.2
- remove console.log message
- fix margin bottom and margin left sets
- better code for argumentString
- fix processing argument for -print-footer
- change version to 1.0.2

# version 1.0.1
- Upgrade max version to Firefox 49.*
