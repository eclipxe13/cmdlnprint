/* jshint moz: true */

var gLocked = false;
var gPrintProgressListener = {
    onStateChange: function (aWebProgress, aRequest, aStateFlags, aStatus) {
        delayedShutdown();
    },
    onProgressChange: function (aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {
        // don't implement
    },
    onLocationChange: function (aWebProgress, aRequest, aLocation, aFlags) {
        // don't implement
    },
    onStatusChange: function (aWebProgress, aRequest, aStatus, aMessage) {
        // don't implement
    },
    onSecurityChange: function (aWebProgress, aRequest, aState) {
        // don't implement
    },
    /* nsISupports */
    QueryInterface: function progress_qi(aIID) {
        if (!aIID.equals(Components.interfaces.nsISupports) &&
            !aIID.equals(Components.interfaces.nsISupportsWeakReference) &&
            !aIID.equals(Components.interfaces.nsIWebProgressListener)) {
            throw Components.results.NS_ERROR_NO_INTERFACE;
        }
        return this;
    }
};

var gBrowserProgressListener = {
    onLocationChange: function (aWebProgress, aRequest, aLocation, aFlags) {
        if (Components.interfaces.nsIWebProgressListener.LOCATION_CHANGE_ERROR_PAGE & aFlags) {
            // At this point, LOAD_BACKGROUND is set, so from now on, no event will
            // be fired.
            setTimeout(onPrintPageLoadComplete, 100);
        }
    },
    /* nsISupports */
    QueryInterface: function progress_qi(aIID) {
        if (!aIID.equals(Components.interfaces.nsISupports) &&
            !aIID.equals(Components.interfaces.nsISupportsWeakReference) &&
            !aIID.equals(Components.interfaces.nsIWebProgressListener)) {
            throw Components.results.NS_ERROR_NO_INTERFACE;
        }
        return this;
    }
};

function saveDocumentAsHtml()
{
    var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(window.arguments[2]);
    var io = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
    var persist = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1']
            .createInstance(Components.interfaces.nsIWebBrowserPersist);
    persist.persistFlags =
            Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_REPLACE_EXISTING_FILES |
            Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_BYPASS_CACHE |
            Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_FIXUP_ORIGINAL_DOM |
            Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_FIXUP_LINKS_TO_DESTINATION |
            Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_SERIALIZE_OUTPUT |
            Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_FIXUP_LINKS_TO_DESTINATION |
            Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
    persist.progressListener = gPrintProgressListener;
    persist.saveDocument(
        content.document,
        file,
        null,
        null,
        Components.interfaces.nsIWebBrowserPersist.ENCODE_FLAGS_ABSOLUTE_LINKS |
            Components.interfaces.nsIWebBrowserPersist.ENCODE_FLAGS_ENCODE_W3C_ENTITIES,
        0
    );
}

function saveCanvas(canvas, path) {
    // Convert the Canvas to a Binary Stream
    try {
        var io = Components.classes['@mozilla.org/network/io-service;1']
            .getService(Components.interfaces.nsIIOService);
        // https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIIOService#newChannelFromURI2()
        var dataChannel = io.newChannelFromURI2(
            io.newURI(canvas.toDataURL('image/png', 1), null, null), // aURI
            null, // Services.scriptSecurityManager.getSystemPrincipal(), // aLoadingNode
            null, // aLoadingPrincipal
            null, // aTriggeringPrincipal
            Components.interfaces.nsILoadInfo.SEC_NORMAL, // aSecurityFlags
            Components.interfaces.nsIContentPolicy.TYPE_OTHER // aContentPolicyType
        );
        var binStream = Components.classes["@mozilla.org/binaryinputstream;1"]
            .createInstance(Components.interfaces.nsIBinaryInputStream);
        binStream.setInputStream(dataChannel.open());
        var file = Components.classes['@mozilla.org/file/local;1']
            .createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(path);
        var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
            .createInstance(Components.interfaces.nsIFileOutputStream);
        foStream.init(file, 0x02 | 0x08 | 0x20, 0x1B6, 0);
        const kMaxBlockSize = 65536;
        var remaining = binStream.available();
        while (remaining > 0) {
            var count = (remaining > kMaxBlockSize) ? kMaxBlockSize : remaining;
            var b = binStream.readBytes(count);
            foStream.write(b, count);
            remaining -= count;
        }
        foStream.close();
        delayedShutdown();
    } catch (ex) {
        console.log(ex);
    }
}

function startup() {
    sizeToContent();
    getBrowser().webProgress.addProgressListener(gBrowserProgressListener, Components.interfaces.nsIWebProgress .NOTIFY_LOCATION);
    getBrowser().addEventListener('pageshow', onPrintPageShow, false);
    var uri = window.arguments[0];
    if (uri) {
        try {
            getBrowser().loadURI(uri);
        } catch (e) {
            /* print error page, if possible */
            window.setTimeout(onPrintPageLoadComplete, 100);
        }
    } else {
        delayedShutdown();
    }
    /* Force killing process, if printing flow stopped for some reason,
     e.g. a network error prevents pageshow events from firing. */
    var timeout = 180;
    window.setTimeout(function () {
        window.close();
    }, timeout * 1000);
}

function printWithCanvas() {
    var canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    var canvasWidth = content.scrollMaxX + content.innerWidth;
    var canvasHeight = content.scrollMaxY + content.innerHeight;
    /*
     Remove offset from scrollbar width.

     17px on WindowsXP, but this may depends on client theme or something.
     I guess the real width would be 16, plus extra 1px border for drop-
     -shadow.
     XXX FIXME!
     */
    if (content.scrollMaxX) {
        canvasHeight -= 17;
    }
    if (content.scrollMaxY) {
        canvasWidth -= 17;
    }
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.scale(1, 1);
    ctx.drawWindow(content, 0, 0, canvasWidth, canvasHeight, 'rgb(128,128,128)');
    saveCanvas(canvas, window.arguments[2]);
}

function onPrintPageShow(aEvent) {
    if (getBrowser().contentDocument.readyState === 'complete') {
        setTimeout(onPrintPageLoadComplete, 0);
    } else {
        content.document.addEventListener('readystatechange', onDocumentReadyStateChange, false);
    }
}

function onDocumentReadyStateChange(aEvent) {
    if (getBrowser().contentDocument.readyState === 'complete') {
        onPrintPageLoadComplete();
    }
}

function onPrintPageLoadComplete() {

    if ('' === window.arguments[3] || '0' === window.arguments[3]) {
        delayedPrintPageLoadComplete();
    } else {
        var delay = parseInt(window.arguments[3]);
        if (delay < 0) {
            delay = 0;
        }
        if (delay > 120) {
            delay = 120;
        }
        setTimeout(function () {
            delayedPrintPageLoadComplete();
        }, delay * 1000);
    }
}

/**
 * @var nsIPrintSettings settings
 * https://dxr.mozilla.org/mozilla-beta/source/widget/nsIPrintSettings.idl
 * http://stage.oxymoronical.com/experiments/xpcomref/applications/Firefox/3.5/interfaces/nsIPrintSettings
 */
function setupOtherPreferences(settings) {
    // orientation
    var aOrientation = (window.arguments[5]) ? window.arguments[5] : 'default';
    settings.orientation =
            (aOrientation === 'portrait') ? settings.kPortraitOrientation :
            (aOrientation === 'landscape') ? settings.kLandscapeOrientation :
            settings.orientation;
    // printBGColors
    var aBGColors = (window.arguments[6]) ? window.arguments[6] : 'default';
    settings.printBGColors =
            (aBGColors === 'yes') ? true :
            (aBGColors === 'no') ? false :
            settings.printBGColors;
    // printBGImages
    var aBGImages = (window.arguments[7]) ? window.arguments[7] : 'default';
    settings.printBGImages =
            (aBGImages === 'yes') ? true :
            (aBGImages === 'no') ? false :
            settings.printBGImages;
    // shrinkToFit
    var aShrinkToFit = (window.arguments[8]) ? window.arguments[8] : 'default';
    settings.shrinkToFit =
            (aShrinkToFit === 'yes') ? true :
            (aShrinkToFit === 'no') ? false :
            settings.shrinkToFit;
    // setup headers and footers
    if ('no' === window.arguments[9] || 'user_pref' !== window.arguments[10]) {
        settings.headerStrLeft = window.arguments[10];
    }
    if ('no' === window.arguments[9] || 'user_pref' !== window.arguments[11]) {
        settings.headerStrCenter = window.arguments[11];
    }
    if ('no' === window.arguments[9] || 'user_pref' !== window.arguments[12]) {
        settings.headerStrRight = window.arguments[12];
    }
    if ('no' === window.arguments[13] || 'user_pref' !== window.arguments[14]) {
        settings.footerStrLeft = window.arguments[14];
    }
    if ('no' === window.arguments[13] || 'user_pref' !== window.arguments[15]) {
        settings.footerStrCenter = window.arguments[15];
    }
    if ('no' === window.arguments[13] || 'user_pref' !== window.arguments[16]) {
        settings.footerStrRight = window.arguments[16];
    }
    // range
    if ('yes' === window.arguments[17]) {
        settings.printRange = settings.kRangeSpecifiedPageRange;
        settings.startPageRange = parseInt(window.arguments[18], 10);
        settings.endPageRange = parseInt(window.arguments[19], 10);
    }
    // paper size
    // unwriteable margins
    settings.unwriteableMarginTop = 0;
    settings.unwriteableMarginRight = 0;
    settings.unwriteableMarginBottom = 0;
    settings.unwriteableMarginLeft = 0;
    if ('yes' === window.arguments[20]) {
        settings.paperSizeType = settings.kPaperSizeDefined;
        settings.paperSizeUnit = (window.arguments[21] === 'in') ? settings.kPaperSizeInches : settings.kPaperSizeMillimeters;
        settings.paperWidth = parseFloat(window.arguments[22]);
        settings.paperHeight = parseFloat(window.arguments[23]);
    } else {
        if (window.arguments[21] === 'mm' && settings.paperSizeUnit !== settings.kPaperSizeMillimeters) {
            settings.paperWidth = parseFloat(settings.paperWidth) * 25.4;
            settings.paperHeight = parseFloat(settings.paperHeight) * 25.4;
        }
        if (window.arguments[21] === 'in' && settings.paperSizeUnit !== settings.kPaperSizeInches) {
            settings.paperWidth = parseFloat(settings.paperWidth) / 25.4;
            settings.paperHeight = parseFloat(settings.paperHeight) / 25.4;
        }
        settings.paperSizeUnit = (window.arguments[21] === 'in') ? settings.kPaperSizeInches : settings.kPaperSizeMillimeters;
    }
    var mmToInches = (settings.paperSizeUnit === settings.kPaperSizeInches) ? 1 : 25.4;
    // page margins (are always in inches)
    if ('' !== window.arguments[24]) {
        settings.marginTop = parseFloat(window.arguments[24]) / mmToInches;
    }
    if ('' !== window.arguments[25]) {
        settings.marginRight = parseFloat(window.arguments[25]) / mmToInches;
    }
    if ('' !== window.arguments[26]) {
        settings.marginBottom = parseFloat(window.arguments[26]) / mmToInches;
    }
    if ('' !== window.arguments[27]) {
        settings.marginLeft = parseFloat(window.arguments[27]) / mmToInches;
    }
    // page edges (are always in inches)
    if ('' !== window.arguments[28]) {
        settings.edgeTop = parseFloat(window.arguments[28]) / mmToInches;
    }
    if ('' !== window.arguments[29]) {
        settings.edgeRight = parseFloat(window.arguments[29]) / mmToInches;
    }
    if ('' !== window.arguments[30]) {
        settings.edgeBottom = parseFloat(window.arguments[30]) / mmToInches;
    }
    if ('' !== window.arguments[31]) {
        settings.edgeLeft = parseFloat(window.arguments[31]) / mmToInches;
    }
    // resolution
    var aResolution = parseInt(window.arguments[33], 10);
    if (aResolution > 0) {
        settings.resolution = aResolution;
    }
    // scaling
    var aScaling = parseFloat(window.arguments[34]);
    if (aScaling > 0) {
        settings.scaling = aScaling;
    }
}

function delayedPrintPageLoadComplete() {
    if (gLocked) {
        return;
    }
    var printInfo = ('yes' === window.arguments[32]);
    gLocked = true;
    var mode = window.arguments[1];
    // attend png and html modes
    if (mode === 'png') {
        printWithCanvas();
        return;
    } else if (mode === 'html') {
        saveDocumentAsHtml();
        return;
    }
    // We can't convert from XUL to printable format.
    if (content.document.contentType === 'text/xul' || content.document.contentType === 'application/vnd.mozilla.xul+xml') {
        delayedShutdown();
        return;
    }

    /* printing API */
    var printSettingsService = Components.classes['@mozilla.org/gfx/printsettings-service;1']
        .getService(Components.interfaces.nsIPrintSettingsService);

    // http://stage.oxymoronical.com/experiments/xpcomref/applications/Firefox/3.5/interfaces/nsIPrintSettings
    var settings = printSettingsService.newPrintSettings;
    switch (mode) {
        case 'printer':
            var printerName = ('default' === window.arguments[4]) ? printSettingsService.defaultPrinterName : '';
            /* Check whether the printer name specified by an argument is valid. */
            var list =
                    Components.classes['@mozilla.org/gfx/printerenumerator;1']
                    .getService(Components.interfaces.nsIPrinterEnumerator)
                    .printerNameList;
            while (list.hasMore()) {
                if (window.arguments[4] === list.getNext()) {
                    printerName = window.arguments[4];
                    break;
                }
            }
            /* we could not find a valid printer name */
            if ('' === printerName) {
                delayedShutdown();
                return;
            }
            /* continue with setup */
            printSettingsService.initPrintSettingsFromPrinter(printerName, settings);
            printSettingsService.initPrintSettingsFromPrefs(settings, true, Components.interfaces.nsIPrintSettings.kInitSaveAll);
            break;
        case 'pdf':
        case 'ps':
            /*
             There's no way to set *global* settings in Firefox 3.0.
             I'm not too sure why, but UI is gone. This is not rendering bug,
             but browser (or toolkit) bug.
             So copy from default printer settings.
             */
            settings.printerName = printSettingsService.defaultPrinterName;
            /* We have no interest on those other than prefs. */
            printSettingsService.initPrintSettingsFromPrefs(settings, true, Components.interfaces.nsIPrintSettings.kInitSaveAll);
            settings.printerName = null;
            /* settings for PDF. */
            settings.printToFile = true;
            settings.toFileName = window.arguments[2];
            settings.outputFormat = (mode === 'pdf') ?
                Components.interfaces.nsIPrintSettings.kOutputFormatPDF :
                Components.interfaces.nsIPrintSettings.kOutputFormatPS;
            break;
        default:
            /* Unkown mode. Can it go on? */
            return;
    }
    /* setup other preferences */
    setupOtherPreferences(settings);
    settings.printSilent = true;
    if (printInfo) console.log(settings);
    try {
        var webBrowserPrint = content.
            QueryInterface(Components.interfaces.nsIInterfaceRequestor).
            getInterface(Components.interfaces.nsIWebBrowserPrint);
        webBrowserPrint.print(settings, gPrintProgressListener);
    } catch (ex) {
        console.log(ex);
    }
}

function delayedShutdown() {
    window.setTimeout(function () {
        window.close();
    }, 100);
}

function getBrowser() {
    return document.getElementById('content');
}
