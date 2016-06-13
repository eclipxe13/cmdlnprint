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
        try {
            var returnValue = value;
        } catch (ex) {
            returnValue = defaultValue;
        }
        return returnValue;
    },
    argumentBoolean: function(value, defaultValue) {
        if (null === value) return defaultValue;
        var returnValue = defaultValue;
        value = value.toLowerCase();
        if (value === 'yes' || value === 'y' || value === '1') {
            returnValue = 'yes';
        }
        if (value === 'no' || value === 'n' || value === '0') {
            returnValue = 'no';
        }
        return returnValue;
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
            print: this.argumentString(cmdline.handleFlagWithParam('print', false), ''),
            mode: this.argumentMode(cmdline.handleFlagWithParam('print-mode', false), 'printer'),
            file: this.argumentString(cmdline.handleFlagWithParam('print-file', false), ''),
            delay: this.argumentFloat(cmdline.handleFlagWithParam('print-delay', false), 0),
            printer: this.argumentString(cmdline.handleFlagWithParam('print-printer', false), ''),
            orientation: this.argumentString(cmdline.handleFlagWithParam('print-orientation', false), ''),
            bgcolors: this.argumentBoolean(cmdline.handleFlagWithParam('print-bgcolors', false), ''),
            bgimages: this.argumentBoolean(cmdline.handleFlagWithParam('print-bgimages', false), ''),
            shrinktofit: this.argumentBoolean(cmdline.handleFlagWithParam('print-shrinktofit', false), ''),
            header: this.argumentBoolean(cmdline.handleFlagWithParam('print-header', false), 'no'),
            headerLeft: this.argumentString(cmdline.handleFlagWithParam('print-header-left', false), ''),
            headerCenter: this.argumentString(cmdline.handleFlagWithParam('print-header-center', false), ''),
            headerRight: this.argumentString(cmdline.handleFlagWithParam('print-header-right', false), ''),
            footer: cmdline.handleFlagWithParam('print-footer', false),
            footerLeft: this.argumentString(cmdline.handleFlagWithParam('print-footer-left', false), ''),
            footerCenter: this.argumentString(cmdline.handleFlagWithParam('print-footer-center', false), ''),
            footerRight: this.argumentString(cmdline.handleFlagWithParam('print-footer-right', false), ''),
            range: this.argumentBoolean(cmdline.handleFlagWithParam('print-range', false), 'no'),
            rangeStart: this.argumentInteger(cmdline.handleFlagWithParam('print-range-start', false), 1),
            rangeEnd: this.argumentInteger(cmdline.handleFlagWithParam('print-range-end', false), 1),
            paperCustom: this.argumentBoolean(cmdline.handleFlagWithParam('print-paper-custom', false), 'no'),
            paperUnits: this.argumentString(cmdline.handleFlagWithParam('print-paper-units', false), 'in'),
            paperWidth: this.argumentFloat(cmdline.handleFlagWithParam('print-paper-width', false), 25.4 * 8.5),
            paperHeight: this.argumentFloat(cmdline.handleFlagWithParam('print-paper-height', false), 25.4 * 11),
            marginTop: this.argumentFloat(cmdline.handleFlagWithParam('print-margin-top', false), 0.4),
            marginRight: this.argumentFloat(cmdline.handleFlagWithParam('print-margin-right', false), 0.4),
            marginBottom: this.argumentFloat(cmdline.handleFlagWithParam('print-margin-bottom', false), 0.4),
            marginLeft: this.argumentFloat(cmdline.handleFlagWithParam('print-margin-left', false), 0.4)
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
            options.orientation = 'in';
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
