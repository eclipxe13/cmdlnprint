// cmdlnprint specific settings for testing

// allow non-signed extensions
lockPref("xpinstall.signatures.required", false);
lockPref("xpinstall.whitelist.required", false);

// disable telemetry
lockPref("toolkit.telemetry.reportingpolicy.firstRun", false);

// Don't check for the default browser
lockPref("browser.shell.checkDefaultBrowser", false);

// Don't show 'know your rights' on first run
lockPref("browser.rights.3.shown", true);

// Don't show WhatsNew on first run after every update
lockPref("browser.startup.homepage_override.mstone", "ignore");

// Don't ask to install the Flash plugin
lockPref("plugins.notifyMissingFlash", false);
