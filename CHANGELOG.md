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
