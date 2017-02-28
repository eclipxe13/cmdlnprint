//You must start the file with a comment!
//After hours reading the interwebs it appears that even though the mozilla docs
//say you can use defaultPref in the "Config File" aka mozilla.cfg it doesn't work
//So we have to put these here.  Unfortunately lockPref is only supported over there
//So we need both.  :(

sticky_pref("browser.bookmarks.restore_default_bookmarks", false);
sticky_pref("browser.newtabpage.enhanced", false);
sticky_pref("browser.safebrowsing.downloads.enabled", false);
sticky_pref("browser.safebrowsing.enabled", false);
sticky_pref("browser.search.suggest.enabled", false);
sticky_pref("browser.search.update", false);
sticky_pref("browser.sessionstore.resume_from_crash", false);
sticky_pref("browser.startup.page", 0);
sticky_pref("browser.tabs.crashReporting.sendReport", false);
sticky_pref("browser.tabs.remote.autostart.2", true);
sticky_pref("browser.urlbar.autocomplete.enabled", false);
sticky_pref("browser.urlbar.suggest.bookmark", false);
sticky_pref("browser.urlbar.suggest.history", false);
sticky_pref("browser.urlbar.suggest.openpage", false);
sticky_pref("dom.disable_open_during_load", false);
sticky_pref("general.warnOnAboutConfig", false);
sticky_pref("layout.spellcheckDefault", 0);
sticky_pref("print.print_footerleft", "");
sticky_pref("print.print_footerright", "");
sticky_pref("print.print_headerleft", "");
sticky_pref("print.print_headerright", "");
sticky_pref("signon.rememberSignons", false);
sticky_pref("toolkit.telemetry.reportingpolicy.firstRun", false);
sticky_pref("xpinstall.signatures.required", false);
sticky_pref("xpinstall.whitelist.required", false);

// Don't check for the default browser
sticky_pref("browser.shell.checkDefaultBrowser", false);

// Don't show 'know your rights' on first run
pref("browser.rights.3.shown", true);

// Don't show WhatsNew on first run after every update
pref("browser.startup.homepage_override.mstone","ignore");

// Don't ask to install the Flash plugin
pref("plugins.notifyMissingFlash", false);

//call firefox with --start-debugger-server to use debugger
//only ff37+
sticky_pref("devtools.debugger.prompt-connection", false);
sticky_pref("devtools.debugger.force-local", false);
