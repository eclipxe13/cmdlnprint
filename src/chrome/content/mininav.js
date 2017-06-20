/* eslint-env mozilla/browser-window */

let gLocked = false;

const gPrintProgressListener = {
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
        if (! aIID.equals(Components.interfaces.nsISupports) &&
            ! aIID.equals(Components.interfaces.nsISupportsWeakReference) &&
            ! aIID.equals(Components.interfaces.nsIWebProgressListener)) {
            throw Components.results.NS_ERROR_NO_INTERFACE;
        }
        return this;
    }
};

const gBrowserProgressListener = {
    onLocationChange: function (aWebProgress, aRequest, aLocation, aFlags) {
        if (Components.interfaces.nsIWebProgressListener.LOCATION_CHANGE_ERROR_PAGE & aFlags) {
            // At this point, LOAD_BACKGROUND is set, so from now on, no event will
            // be fired.
            window.setTimeout(onPrintPageLoadComplete, 100);
        }
    },
    /* nsISupports */
    QueryInterface: function progress_qi(aIID) {
        if (! aIID.equals(Components.interfaces.nsISupports) &&
            ! aIID.equals(Components.interfaces.nsISupportsWeakReference) &&
            ! aIID.equals(Components.interfaces.nsIWebProgressListener)) {
            throw Components.results.NS_ERROR_NO_INTERFACE;
        }
        return this;
    }
};

function saveDocumentAsHtml() {
    const file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(window.arguments[2]);
    const persist = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1']
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
        const io = Components.classes['@mozilla.org/network/io-service;1']
            .getService(Components.interfaces.nsIIOService);
        // https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIIOService#newChannelFromURI2()
        const dataChannel = io.newChannelFromURI2(
            io.newURI(canvas.toDataURL('image/png', 1), null, null), // aURI
            null, // Services.scriptSecurityManager.getSystemPrincipal(), // aLoadingNode
            null, // aLoadingPrincipal
            null, // aTriggeringPrincipal
            Components.interfaces.nsILoadInfo.SEC_NORMAL, // aSecurityFlags
            Components.interfaces.nsIContentPolicy.TYPE_OTHER // aContentPolicyType
        );
        const binStream = Components.classes['@mozilla.org/binaryinputstream;1']
            .createInstance(Components.interfaces.nsIBinaryInputStream);
        binStream.setInputStream(dataChannel.open());
        const file = Components.classes['@mozilla.org/file/local;1']
            .createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(path);
        const foStream = Components.classes['@mozilla.org/network/file-output-stream;1']
            .createInstance(Components.interfaces.nsIFileOutputStream);
        foStream.init(file, 0x02 | 0x08 | 0x20, 0x1B6, 0);
        const kMaxBlockSize = 65536;
        let remaining = binStream.available();
        while (remaining > 0) {
            let count = (remaining > kMaxBlockSize) ? kMaxBlockSize : remaining;
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
    window.sizeToContent();
    const browser = window.getBrowser();
    browser.webProgress.addProgressListener(gBrowserProgressListener, Components.interfaces.nsIWebProgress .NOTIFY_LOCATION);
    browser.addEventListener('pageshow', onPrintPageShow, false);
    const uri = window.arguments[0];
    if (uri) {
        try {
            browser.loadURI(uri);
            // shortcut is documented in the following url since browser.type = "content-primary" but it seems to fail on firefox 54
            // https://developer.mozilla.org/en-US/docs/Working_with_windows_in_chrome_code#Accessing_content_documents
            // https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/browser#a-browser.type
            // https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/browser#p-contentWindow
            // https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Property/contentWindow
            if (null === window.content) {
                // do not use contentWindow.wrappedJSObject, it makes unable to use QueryInterface
                window.content = browser.contentWindow;
            }
        } catch (ex) {
            /* print error page, if possible */
            window.setTimeout(onPrintPageLoadComplete, 100);
        }
    } else {
        delayedShutdown();
    }
    /* Force killing process, if printing flow stopped for some reason,
     e.g. a network error prevents pageshow events from firing. */
    const timeout = 180;
    window.setTimeout(function () {
        window.close();
    }, timeout * 1000);
}

function printWithCanvas() {
    const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    let canvasWidth = content.scrollMaxX + content.innerWidth;
    let canvasHeight = content.scrollMaxY + content.innerHeight;
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

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.scale(1, 1);
    ctx.drawWindow(content, 0, 0, canvasWidth, canvasHeight, 'rgb(128,128,128)');
    saveCanvas(canvas, window.arguments[2]);
}

function onPrintPageShow(aEvent) {
    if ('complete' === getBrowser().contentDocument.readyState) {
        window.setTimeout(onPrintPageLoadComplete, 100);
    } else {
        content.document.addEventListener('readystatechange', onDocumentReadyStateChange, false);
    }
}

function onDocumentReadyStateChange(aEvent) {
    if ('complete' === getBrowser().contentDocument.readyState) {
        onPrintPageLoadComplete();
    }
}

function onPrintPageLoadComplete() {
    if ('' === window.arguments[3] || '0' === window.arguments[3]) {
        delayedPrintPageLoadComplete();
    } else {
        let delay = parseInt(window.arguments[3]);
        if (delay < 0) {
            delay = 0;
        }
        if (delay > 120) {
            delay = 120;
        }
        window.setTimeout(delayedPrintPageLoadComplete, delay * 1000);
    }
}

/**
 * @var nsIPrintSettings settings
 * https://dxr.mozilla.org/mozilla-beta/source/widget/nsIPrintSettings.idl
 * http://stage.oxymoronical.com/experiments/xpcomref/applications/Firefox/3.5/interfaces/nsIPrintSettings
 */
function setupOtherPreferences(settings) {
    // orientation
    const aOrientation = (window.arguments[5]) ? window.arguments[5] : 'default';
    settings.orientation =
            ('portrait' === aOrientation) ? settings.kPortraitOrientation :
                ('landscape' === aOrientation) ? settings.kLandscapeOrientation :
                    settings.orientation;
    // printBGColors
    const aBGColors = (window.arguments[6]) ? window.arguments[6] : 'default';
    settings.printBGColors =
            ('yes' === aBGColors) ? true :
                ('no' === aBGColors) ? false :
                    settings.printBGColors;
    // printBGImages
    const aBGImages = (window.arguments[7]) ? window.arguments[7] : 'default';
    settings.printBGImages =
            ('yes' === aBGImages) ? true :
                ('no' === aBGImages) ? false :
                    settings.printBGImages;
    // shrinkToFit
    const aShrinkToFit = (window.arguments[8]) ? window.arguments[8] : 'default';
    settings.shrinkToFit =
            ('yes' === aShrinkToFit) ? true :
                ('no' === aShrinkToFit) ? false :
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
        if ('undefined' !== typeof settings.paperSizeType) {
            settings.paperSizeType = settings.kPaperSizeDefined;
        }
        settings.paperSizeUnit = ('in' === window.arguments[21]) ? settings.kPaperSizeInches : settings.kPaperSizeMillimeters;
        settings.paperWidth = parseFloat(window.arguments[22]);
        settings.paperHeight = parseFloat(window.arguments[23]);
    } else {
        if ('mm' === window.arguments[21] && settings.paperSizeUnit !== settings.kPaperSizeMillimeters) {
            settings.paperWidth = parseFloat(settings.paperWidth) * 25.4;
            settings.paperHeight = parseFloat(settings.paperHeight) * 25.4;
        }
        if ('in' === window.arguments[21] && settings.paperSizeUnit !== settings.kPaperSizeInches) {
            settings.paperWidth = parseFloat(settings.paperWidth) / 25.4;
            settings.paperHeight = parseFloat(settings.paperHeight) / 25.4;
        }
        settings.paperSizeUnit = ('in' === window.arguments[21]) ? settings.kPaperSizeInches : settings.kPaperSizeMillimeters;
    }
    const mmToInches = (settings.paperSizeUnit === settings.kPaperSizeInches) ? 1 : 25.4;
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
    const aResolution = parseInt(window.arguments[33], 10);
    if (aResolution > 0) {
        settings.resolution = aResolution;
    }
    // scaling
    const aScaling = parseFloat(window.arguments[34]);
    if (aScaling > 0) {
        settings.scaling = aScaling;
    }
}

function delayedPrintPageLoadComplete() {
    if (gLocked) {
        return;
    }
    gLocked = true;
    const printInfo = ('yes' === window.arguments[32]);
    const mode = window.arguments[1];
    // attend png and html modes
    if ('png' === mode) {
        printWithCanvas();
        return;
    } else if ('html' === mode) {
        saveDocumentAsHtml();
        return;
    }
    // We can't convert from XUL to printable format.
    if ('text/xul' === content.document.contentType || 'application/vnd.mozilla.xul+xml' === content.document.contentType) {
        delayedShutdown();
        return;
    }

    /* printing API */
    const printSettingsService = Components.classes['@mozilla.org/gfx/printsettings-service;1']
        .getService(Components.interfaces.nsIPrintSettingsService);

    // http://stage.oxymoronical.com/experiments/xpcomref/applications/Firefox/3.5/interfaces/nsIPrintSettings
    const settings = printSettingsService.newPrintSettings;
    if ('printer' === mode) {
        let printerName = ('default' === window.arguments[4]) ? printSettingsService.defaultPrinterName : '';
        /* Check whether the printer name specified by an argument is valid. */
        const list = Components.classes['@mozilla.org/gfx/printerenumerator;1']
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
    } else if ('pdf' === mode || 'ps' === mode) {
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
        settings.outputFormat = ('pdf' === mode) ?
            Components.interfaces.nsIPrintSettings.kOutputFormatPDF :
            Components.interfaces.nsIPrintSettings.kOutputFormatPS;
        break;
    } else {
        /* Unkown mode. Can it go on? */
        return;
    }
    /* setup other preferences */
    setupOtherPreferences(settings);
    settings.printSilent = true;
    if (printInfo) {
        console.log(settings);
    }
    try {
        const webBrowserPrint = content.
            QueryInterface(Components.interfaces.nsIInterfaceRequestor).
            getInterface(Components.interfaces.nsIWebBrowserPrint);
        webBrowserPrint.print(settings, gPrintProgressListener);
    } catch (ex) {
        console.log(ex);
    }
}

function delayedShutdown() {
    try {
        window.setTimeout(function () {
            window.close();
        }, 200);
    } catch (ex) {
        return;
    }
}

function getBrowser() {
    return document.getElementById('content');
}
