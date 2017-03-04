/* jshint moz: true */
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cm = Components.manager;

Cm.QueryInterface(Ci.nsIComponentRegistrar);

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");

var EXPORTED_SYMBOLS = ["startup", "shutdown"];

//
// object definition od cmdlnPrintHandler, the cmdlnprint command line handler
// this information matches chrome.manifest
//
function cmdlnPrintHandler() {}
cmdlnPrintHandler.prototype = {
    QueryInterface: XPCOMUtils.generateQI([Ci.nsICommandLineHandler]),
    classDescription: 'cmdlnprint-command-line-handler',
    classID: Components.ID('{80edd604-4028-4c89-a1c1-6e1f25bfa5a7}'),
    contractID: '@forums.mozillazine.org/development/cmdlnprint;1',
    /* nsICommandLineHandler */
    handle : function(cmdLine) {
        var handler = new cmdlPrintRealHandler();
        try {
            var options = handler.retrieveOptionsFromCmdLine(cmdLine);
            // exit if main -print argument was not set
            if (null === options) {
                return;
            }
            if ('yes' === options.info) {
                for (var key in options) {
                    Components.utils.reportError(
                        ' '.repeat(16 - key.length) + key + ': ' + options[key].toString()
                    );
                }
            }
            // Prevent default command line handler to prevent browser/resources from loading,
            // like nsBrowserGlue, nsBrowserContentHandler, ...
            // Mostly to prevent tons of jsm and frame script from loading.
            cmdLine.preventDefault = true;
            return handler.openXulWindow(handler.optionsToWindowArguments(options));
        } catch (ex) {
            Components.utils.reportError(ex);
            return;
        }
    },
    // follow the guidelines in nsICommandLineHandler.idl
    // specifically, flag descriptions should start at
    // character 24, and lines should be wrapped at
    // 72 characters with embedded newlines,
    // and finally, the string should end with a newline
    helpInfo: '  -print <uri>' +
        '         see https://github.com/eclipxe13/cmdlnprint/ for full list of options\n',
};

//
// cmdlPrintRealHandler
// This is the real object to parse the options without any of the
// requirements of mozilla
//
function cmdlPrintRealHandler() {}
cmdlPrintRealHandler.prototype = {
    argumentInteger: function(value, defaultValue) {
        if (null === value || isNaN(value)) return defaultValue;
        try {
            var returnValue = parseInt(value, 10);
            if (isNaN(returnValue) || returnValue < 0) {
                returnValue = defaultValue;
            }
            return returnValue;
        } catch (ex) {
            return defaultValue;
        }
    },
    argumentFloat: function(value, defaultValue) {
        if (null === value || isNaN(value)) return defaultValue;
        try {
            var returnValue = parseFloat(value);
            if (isNaN(returnValue) || returnValue < 0) {
                returnValue = defaultValue;
            }
            return returnValue;
        } catch (ex) {
            return defaultValue;
        }
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
    argumentMargins: function (definition, defaultValue) {
        var parts = definition.split(',');
        var top = this.argumentInteger(parts[0], defaultValue);
        var right = (parts.length > 1) ? this.argumentInteger(parts[1], top) : top;
        var bottom = (parts.length > 2) ? this.argumentInteger(parts[2], top) : top;
        var left = (parts.length > 3) ? this.argumentInteger(parts[3], right) : right;
        return {
            'top': top,
            'right': right,
            'bottom': bottom,
            'left': left
        };
    },
    /**
     * @var nsICommandLineHandler cmdline
     */
    retrieveOptionsFromCmdLine: function (cmdline) {
        var printParameter = this.argumentString(cmdline.handleFlagWithParam('print', false), '');
        if ('' === printParameter) {
            return null;
        }
        // capture every param, do not change the order of the options
        // since in this order are passed to the mininav window
        var options = {
            print: printParameter,                                                                                         // 0
            mode: this.argumentMode(cmdline.handleFlagWithParam('print-mode', false), 'printer'),                          // 1
            file: this.argumentString(cmdline.handleFlagWithParam('print-file', false), ''),                               // 2
            delay: this.argumentFloat(cmdline.handleFlagWithParam('print-delay', false), 0),                               // 3
            printer: this.argumentString(cmdline.handleFlagWithParam('print-printer', false), ''),                         // 4
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
            range: this.argumentBoolean(cmdline.handleFlagWithParam('print-range', false), 'no'),                          // 17
            rangeStart: this.argumentInteger(cmdline.handleFlagWithParam('print-range-start', false), 1),                  // 18
            rangeEnd: this.argumentInteger(cmdline.handleFlagWithParam('print-range-end', false), 1),                      // 19
            paperCustom: this.argumentBoolean(cmdline.handleFlagWithParam('print-paper-custom', false), 'no'),             // 20
            paperUnits: this.argumentString(cmdline.handleFlagWithParam('print-paper-units', false), 'mm'),                // 21
            paperWidth: this.argumentFloat(cmdline.handleFlagWithParam('print-paper-width', false), 25.4 * 8.5),           // 22
            paperHeight: this.argumentFloat(cmdline.handleFlagWithParam('print-paper-height', false), 25.4 * 11),          // 23
            marginTop: this.argumentFloat(cmdline.handleFlagWithParam('print-margin-top', false), 10),                     // 24
            marginRight: this.argumentFloat(cmdline.handleFlagWithParam('print-margin-right', false), 10),                 // 25
            marginBottom: this.argumentFloat(cmdline.handleFlagWithParam('print-margin-bottom', false), 10),               // 26
            marginLeft: this.argumentFloat(cmdline.handleFlagWithParam('print-margin-left', false), 10),                   // 27
            edgeTop: this.argumentFloat(cmdline.handleFlagWithParam('print-edge-top', false), 10),                         // 28
            edgeRight: this.argumentFloat(cmdline.handleFlagWithParam('print-edge-right', false), 10),                     // 29
            edgeBottom: this.argumentFloat(cmdline.handleFlagWithParam('print-edge-bottom', false), 10),                   // 30
            edgeLeft: this.argumentFloat(cmdline.handleFlagWithParam('print-edge-left', false), 10),                       // 31
            info: (cmdline.handleFlag('print-info', false)) ? 'yes' : 'no',                                                // 32
            resolution: this.argumentInteger(cmdline.handleFlagWithParam('print-resolution', false), 0),                   // 33
            scaling: this.argumentFloat(cmdline.handleFlagWithParam('print-scaling', false), 1.0)                          // 34
        };
        var aMargins = this.argumentString(cmdline.handleFlagWithParam('print-margins', false), '');
        if ('' !== aMargins) {
            var borderMargins = this.argumentMargins(aMargins, 10);
            options.marginTop = borderMargins.top;
            options.marginRight = borderMargins.right;
            options.marginBottom = borderMargins.bottom;
            options.marginLeft = borderMargins.left;
        }
        var aEdges = this.argumentString(cmdline.handleFlagWithParam('print-edges', false), '');
        if ('' !== aEdges) {
            var borderEdges = this.argumentMargins(aEdges, 10);
            options.edgeTop = borderEdges.top;
            options.edgeRight = borderEdges.right;
            options.edgeBottom = borderEdges.bottom;
            options.edgeLeft = borderEdges.left;
        }
        // parse uri, return if is a local file and it does not exists false
        var uri = cmdline.resolveURI(options.print);
        if (uri instanceof Ci.nsIFileURL && ! uri.file.exists()) {
            throw '-print uri is a local file and it does not exists';
        }
        options.print = uri.spec;
        // output file
        if ('printer' !== options.mode) {
            if ('' === options.file) {
                throw 'Invalid argument -print-file: empty argument';
            }
            var aFileURI = cmdline.resolveURI(options.file);
            if (!aFileURI.schemeIs('file')) {
                throw 'Invalid argument -print-file: Destination is not a local file';
            }
            options.file = decodeURI(aFileURI.path);
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
        // resolution
        if (isNaN(options.resolution) || options.resolution < 0) {
            options.resolution = 0;
        }
        return options;
    },
    openXulWindow: function(optionsAsArguments) {
        return Services.ww.openWindow(
            null,                                        // aParent
            'chrome://cmdlnprint/content/mininav.xul',   // aUrl
            '_blank',                                    // aName
            'chrome,dialog=no,all',                      // aFeatures
            optionsAsArguments                           // aArguments
        );
    },
    optionsToWindowArguments: function (options) {
        var windowArguments = Cc["@mozilla.org/supports-array;1"].createInstance(Ci.nsICollection);
        for (var key in options) {
            var argString = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
            argString.data = (null === options[key]) ? '' : options[key].toString();
            windowArguments.AppendElement(argString);
        }
        return windowArguments;
    },
};

const CmdlnPrintHandlerFactory = XPCOMUtils.generateNSGetFactory([cmdlnPrintHandler])(cmdlnPrintHandler.prototype.classID);

function startup(aData, aReason) {
    Cm.registerFactory(
        cmdlnPrintHandler.prototype.classID,
        cmdlnPrintHandler.prototype.classDescription,
        cmdlnPrintHandler.prototype.contractID,
        CmdlnPrintHandlerFactory
    );
  var categoryManager = Cc["@mozilla.org/categorymanager;1"].getService(Ci.nsICategoryManager);
  categoryManager.addCategoryEntry('command-line-handler', 'm-cmdlnprint', cmdlnPrintHandler.prototype.contractID, false, true);
}

function shutdown(aData, aReason) {
  var categoryManager = Cc["@mozilla.org/categorymanager;1"].getService(Ci.nsICategoryManager);
  categoryManager.deleteCategoryEntry('command-line-handler', 'm-cmdlnprint', false);
  Cm.unregisterFactory(cmdlnPrintHandler.prototype.classID, CmdlnPrintHandlerFactory);
}
