var gComponent = {
    argumentInteger: function(value, defaultValue) {
        if (null === value) return defaultValue;
        try {
            var returnValue = parseInt(value, 10);
            if (returnValue < 0) {
                returnValue = defaultValue;
            }
        } catch (ex) {
            returnValue = defaultValue;
        }
        return returnValue;
    },
    argumentFloat: function(value, defaultValue) {
        if (null === value) return defaultValue;
        try {
            var returnValue = parseFloat(value);
            if (returnValue < 0) {
                returnValue = defaultValue;
            }
        } catch (ex) {
            returnValue = defaultValue;
        }
        return returnValue;
    },
    argumentString: function(value, defaultValue) {
        if (null === value) return defaultValue;
        return String(value);
    },
    argumentBoolean: function(value, defaultValue) {
        if (null === value) {
            return defaultValue;
        }
        value = value.toLowerCase();
        if (value === 'yes' || value === 'y' || value === '1' || value === 'on') {
            return 'yes';
        }
        if (value === 'no' || value === 'n' || value === '0' || value === 'off') {
            return 'no';
        }
        return defaultValue;
    },
    argumentMode: function(value, defaultValue) {
        if (null === value) return defaultValue;
        switch (value.toLowerCase()) {
            case '1':
            case 'pdf':
                value = 'pdf';
                break;
            case '2':
            case 'png':
                value = 'png';
                break;
            case '3':
            case 'ps':
            case 'postscript':
                value = 'ps';
                break;
            case '4':
            case 'html':
            case 'text':
            case 'htm':
            case 'txt':
                value = 'html';
                break;
            default:
                value = 'printer';
        }
        return value;
    },
    /* nsICommandLineHandler */
    handle: function comp_hadle(cmdline) {
        // capture every param, do not change the order since in this order are passed to the mininav window
        var options = {
            print: this.argumentString(cmdline.handleFlagWithParam('print', false), ''),                          // 0
            mode: this.argumentMode(cmdline.handleFlagWithParam('print-mode', false), 'printer'),                 // 1
            file: this.argumentString(cmdline.handleFlagWithParam('print-file', false), ''),                      // 2
            delay: this.argumentFloat(cmdline.handleFlagWithParam('print-delay', false), 0),                      // 3
            printer: this.argumentString(cmdline.handleFlagWithParam('print-printer', false), ''),                // 4
            orientation: this.argumentString(cmdline.handleFlagWithParam('print-orientation', false), 'default'),          // 5
            bgcolors: this.argumentBoolean(cmdline.handleFlagWithParam('print-bgcolors', false), 'default'),               // 6
            bgimages: this.argumentBoolean(cmdline.handleFlagWithParam('print-bgimages', false), 'default'),               // 7
            shrinktofit: this.argumentBoolean(cmdline.handleFlagWithParam('print-shrinktofit', false), 'default'),         // 8
            header: this.argumentBoolean(cmdline.handleFlagWithParam('print-header', false), 'no'),                        // 9
            headerLeft: this.argumentString(cmdline.handleFlagWithParam('print-header-left', false), 'user_pref'),         // 10
            headerCenter: this.argumentString(cmdline.handleFlagWithParam('print-header-center', false), 'user_pref'),     // 11
            headerRight: this.argumentString(cmdline.handleFlagWithParam('print-header-right', false), 'user_pref'),       // 12
            footer: this.argumentBoolean(cmdline.handleFlagWithParam('print-footer', false), 'no'),                        // 13
            footerLeft: this.argumentString(cmdline.handleFlagWithParam('print-footer-left', false), 'user_pref'),         // 14
            footerCenter: this.argumentString(cmdline.handleFlagWithParam('print-footer-center', false), 'user_pref'),     // 15
            footerRight: this.argumentString(cmdline.handleFlagWithParam('print-footer-right', false), 'user_pref'),       // 16
            range: this.argumentBoolean(cmdline.handleFlagWithParam('print-range', false), 'no'),                 // 17
            rangeStart: this.argumentInteger(cmdline.handleFlagWithParam('print-range-start', false), 1),         // 18
            rangeEnd: this.argumentInteger(cmdline.handleFlagWithParam('print-range-end', false), 1),             // 19
            paperCustom: this.argumentBoolean(cmdline.handleFlagWithParam('print-paper-custom', false), 'no'),    // 20
            paperUnits: this.argumentString(cmdline.handleFlagWithParam('print-paper-units', false), 'mm'),       // 21
            paperWidth: this.argumentFloat(cmdline.handleFlagWithParam('print-paper-width', false), 25.4 * 8.5),  // 22
            paperHeight: this.argumentFloat(cmdline.handleFlagWithParam('print-paper-height', false), 25.4 * 11), // 23
            marginTop: this.argumentFloat(cmdline.handleFlagWithParam('print-margin-top', false), 10),            // 24
            marginRight: this.argumentFloat(cmdline.handleFlagWithParam('print-margin-right', false), 10),        // 25
            marginBottom: this.argumentFloat(cmdline.handleFlagWithParam('print-margin-bottom', false), 10),      // 26
            marginLeft: this.argumentFloat(cmdline.handleFlagWithParam('print-margin-left', false), 10),          // 27
            edgeTop: this.argumentFloat(cmdline.handleFlagWithParam('print-edge-top', false), 10),                // 28
            edgeRight: this.argumentFloat(cmdline.handleFlagWithParam('print-edge-right', false), 10),            // 29
            edgeBottom: this.argumentFloat(cmdline.handleFlagWithParam('print-edge-bottom', false), 10),          // 30
            edgeLeft: this.argumentFloat(cmdline.handleFlagWithParam('print-edge-left', false), 10),              // 31
            info: this.argumentBoolean(cmdline.handleFlagWithParam('print-info', false), 'no')                    // 32
        };
        // exit if main -print argument was not set
        if ('' === options.print) {
            return;
        }
        // parse uri, return if false
        try {
            var uri = cmdline.resolveURI(options.print);
            if (uri instanceof Components.interfaces.nsIFileURL && ! uri.file.exists()) {
                Components.utils.reportError('-print uri is a local file and it does not exists');
                return;
            }
            options.print = uri.spec;
        } catch (ex) {
            Components.utils.reportError(ex);
            return;
        }
        // output
        try {
            options.file = cmdline.resolveFile(options.file).path;
        } catch (ex) {
            Components.utils.reportError('-print-file argument is incorrect, please provide an absolute path');
            return;
        }
        // mode + output
        if ('' === options.file && (options.mode === 'pdf' || options.mode === 'png' || options.mode === 'ps' || options.mode === 'htm')) {
            Components.utils.reportError('Invalid argument -print-file');
            return;
        }
        // printer
        options.printer = ('' === options.printer) ? 'default' : options.printer;
        // orientation
        if ('portrait' !== options.orientation && 'landscape' !== options.orientation) {
            options.orientation = '';
        }
        if ('no' === options.header) {
            options.headerCenter = '';
            options.headerLeft = '';
            options.headerRight = '';
        }
        if ('no' === options.footer) {
            options.footerCenter = '';
            options.footerLeft = '';
            options.footerRight = '';
        }
        if ('in' !== options.paperUnits && 'mm' !== options.paperUnits) {
            options.paperUnits = 'in';
        }
        if ('yes' === options.info) {
            for (var key in options) {
                Components.utils.reportError(' '.repeat(16 - key.length) + key + ': ' + options[key].toString());
            }
        }
        // options to array
        var windowArguments = this.optionsToWindowArguments(options);
        // open the window
        cmdline.preventDefault = true;
        return Components.classes['@mozilla.org/embedcomp/window-watcher;1']
                .getService(Components.interfaces.nsIWindowWatcher)
                .openWindow(null, 'chrome://cmdlnprint/content/mininav.xul', '_blank', 'chrome,dialog=no,all', windowArguments);
    },
    optionsToWindowArguments: function (options) {
        var windowArguments = Components.classes["@mozilla.org/supports-array;1"].createInstance(Components.interfaces.nsICollection);
        for (var key in options) {
            var argString = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
            argString.data = (null === options[key]) ? '' : options[key].toString();
            windowArguments.AppendElement(argString);
        }
        return windowArguments;
    },
    helpInfo: '  -print uri, see https://github.com/eclipxe13/cmdlnprint/ for more options\n',
    /* nsISupports */
    QueryInterface: function comp_qi(aIID) {
        if (!aIID.equals(Components.interfaces.nsISupports)
        && !aIID.equals(Components.interfaces.nsICommandLineHandler)
        && !aIID.equals(Components.interfaces.nsIFactory)) {
            throw Components.results.NS_ERROR_NO_INTERFACE;
        }

        return this;
    },
    /* nsIFactory */
    createInstance: function comp_ci(aOuter, aIID) {
        if (aOuter !== null) {
            throw Components.results.NS_ERROR_NO_AGGREGATION;
        }
        return this.QueryInterface(aIID);
    },
    lockFactory: function comp_lf(aLock) {
        // do not implement this method
    }
};

function NSGetFactory(aCID) {
    if (Components.ID('{80edd604-4028-4c89-a1c1-6e1f25bfa5a7}').equals(aCID)) {
        return gComponent;
    }
    throw Components.results.NS_ERROR_FACTORY_NOT_REGISTERED;
}
