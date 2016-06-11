function openWindow(aParent, aURL, aTarget, aFeatures, aArgs) {
  var args = Components.classes["@mozilla.org/supports-array;1"]
                       .createInstance(Components.interfaces.nsICollection);

  while (aArgs && aArgs.length > 0) {
    var arg = aArgs.shift();

    var argstring =
      Components.classes["@mozilla.org/supports-string;1"]
                .createInstance(Components.interfaces.nsISupportsString);

    argstring.data = arg? arg : "";

    args.AppendElement(argstring);
  }

  return Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                   .getService(Components.interfaces.nsIWindowWatcher)
                   .openWindow(aParent, aURL, aTarget, aFeatures, args);

}

function resolveURIInternal(aCmdLine, aArgument) {
  var uri = aCmdLine.resolveURI(aArgument);

  if (!(uri instanceof Components.interfaces.nsIFileURL))
    return uri;

  try {
    if (uri.file.exists())
      return uri;
  }
  catch (e) {
    Components.utils.reportError(e);
  }

  // We have interpreted the argument as a relative file URI, but the file
  // doesn't exist. Try URI fixup heuristics: see bug 290782.

  try {
    var urifixup = Components.classes["@mozilla.org/docshell/urifixup;1"]
                             .getService(Components.interfaces.nsIURIFixup);

    uri = urifixup.createFixupURI(aArgument, 0);
  }
  catch (e) {
    Components.utils.reportError(e);
  }

  return uri;
}

function resolvePathInternal(aCmdLine, aArgument) {
  var file = null;

  if (aArgument)
    file = aCmdLine.resolveFile(aArgument);

  return (file)? file.path : null;
}

function resolveModeInternal(aArgument) {
  var mode = -1;

  if (aArgument) {
    aArgument = aArgument.toString().toLowerCase();
    switch (aArgument) {
    case "1":
    case "pdf":
      mode = 1;
      break;
    case "2":
    case "png":
      mode = 2;
      break;
    case "3":
    case "ps":
    case "postscript":
      mode = 3;
      break;
    case "4":
    case "html":
    case "text":
    case "htm":
    case "txt":
      mode = 4;
      break;
    case "0":
    case "printer":
      mode = 0;
      break;
    default:
      mode = -1;
    }
  }
  return mode;
}

var gComponent = {

  /* nsICommandLineHandler */
  handle : function comp_hadle(aCmdLine) {
    var param = aCmdLine.handleFlagWithParam("print", false);
    if (!param)
      return;

    var uri = resolveURIInternal(aCmdLine, param);

    if (uri) {
      aCmdLine.preventDefault = true;

      param = aCmdLine.handleFlagWithParam("printmode", false);
      var mode = resolveModeInternal(param);

      param = aCmdLine.handleFlagWithParam("printfile", false);
      var path = resolvePathInternal(aCmdLine, param);

      param = aCmdLine.handleFlagWithParam("printdelay", false);
      var delay = 0;
      if (param && !isNaN(param))
        delay = parseInt(param).toString();

      param = aCmdLine.handleFlagWithParam("printprinter", false);
      var printer = param;

      param = aCmdLine.handleFlagWithParam("printorientation", false);
      var printorientation = (param == "portrait" || param == "landscape") ? param : "default" ;

      param = aCmdLine.handleFlagWithParam("printbgcolors", false);
      var printbgcolors = (param == "yes" || param == "no") ? param : "default" ;

      param = aCmdLine.handleFlagWithParam("printbgimages", false);
      var printbgimages = (param == "yes" || param == "no") ? param : "default" ;

      param = aCmdLine.handleFlagWithParam("printshrinktofit", false);
      var printshrinktofit = (param == "yes" || param == "no") ? param : "default" ;

      var printheaderleft = "";
      var printheadercenter = "";
      var printheaderright = "";
      var printfooterleft = "";
      var printfootercenter = "";
      var printfooterright = "";

      param = aCmdLine.handleFlagWithParam("printsetupheader", false);
      var printsetupheader = (param == "yes" || param == "no") ? param : "no" ;
      if (printsetupheader == "yes") {
          printheaderleft = aCmdLine.handleFlagWithParam("printheaderleft", false);
          printheadercenter = aCmdLine.handleFlagWithParam("printheadercenter", false);
          printheaderright = aCmdLine.handleFlagWithParam("printheaderright", false);
      }

      param = aCmdLine.handleFlagWithParam("printsetupfooter", false);
      var printsetupfooter = (param == "yes" || param == "no") ? param : "no" ;
      if (printsetupfooter == "yes") {
          printfooterleft = aCmdLine.handleFlagWithParam("printfooterleft", false);
          printfootercenter = aCmdLine.handleFlagWithParam("printfootercenter", false);
          printfooterright = aCmdLine.handleFlagWithParam("printfooterright", false);
      }

      var startpagerange = 0;
      var endpagerange = 0;
      param = aCmdLine.handleFlagWithParam("printpagerange", false);
      var printpagerange = (param == "yes" || param == "no") ? param : "no" ;
      if (printpagerange == "yes") {
          startpagerange = aCmdLine.handleFlagWithParam("printrangestart", false);
          endpagerange = aCmdLine.handleFlagWithParam("printrangeend", false);
          if (isNaN(startpagerange) || isNaN(endpagerange)) {
              printpagerange == "no";
          } else {
              startpagerange = parseInt(startpagerange, 10);
              endpagerange = parseInt(endpagerange, 10);
              if (startpagerange > endpagerange) {
                  printpagerange == "no";
              }
          }
      }

      param = aCmdLine.handleFlagWithParam("custompaper", false);
      var custompaper = (param == "yes" || param == "no") ? param : "no" ;
      var custompaperunits = "mm";
      var custompaperwidth = 215.9;
      var custompaperheight = 279.4;
      if (custompaper == "yes") {
          param = aCmdLine.handleFlagWithParam("custompaperunits", false);
          custompaperunits = (param == "in" || param == "mm") ? param : "mm" ;
          custompaperwidth = aCmdLine.handleFlagWithParam("custompaperwidth", false);
          custompaperheight = aCmdLine.handleFlagWithParam("custompaperheight", false);
          if (isNaN(custompaperwidth) || isNaN(custompaperheight)) {
              custompaper = "no";
          } else {
              custompaperwidth = parseFloat(custompaperwidth);
              custompaperheight = parseFloat(custompaperheight);
              if (custompaperwidth <= 0 || custompaperheight <= 0) {
                  custompaper = "no";
              }
          }
      }

      param = aCmdLine.handleFlagWithParam("margintop", false);
      var margintop = (isNaN(param) || parseFloat(param) < 0) ? "0" : param;
      param = aCmdLine.handleFlagWithParam("marginright", false);
      var marginright = (isNaN(param) || parseFloat(param) < 0) ? "0" : param;
      param = aCmdLine.handleFlagWithParam("marginbottom", false);
      var marginbottom = (isNaN(param) || parseFloat(param) < 0) ? "0" : param;
      param = aCmdLine.handleFlagWithParam("marginleft", false);
      var marginleft = (isNaN(param) || parseFloat(param) < 0) ? "0" : param;

      openWindow(null, "chrome://cmdlnprint/content/mininav.xul", "_blank",
                 "chrome,dialog=no,all", [
                    uri.spec, mode.toString(), path, delay, printer,
                    printorientation, printbgcolors, printbgimages, printshrinktofit,
                    printsetupheader, printheaderleft, printheadercenter, printheaderright,
                    printsetupfooter, printfooterleft, printfootercenter, printfooterright,
                    printpagerange, startpagerange.toString(), endpagerange.toString(),
                    custompaper, custompaperunits, custompaperwidth, custompaperheight,
                    margintop, marginright, marginbottom, marginleft
                 ]);
    }
  },
  helpInfo : "see https://github.com/eclipxe13/cmdlnprint/\n",
  /* nsISupports */
  QueryInterface : function comp_qi(aIID) {
    if (!aIID.equals(Components.interfaces.nsISupports) &&
        !aIID.equals(Components.interfaces.nsICommandLineHandler) &&
        !aIID.equals(Components.interfaces.nsIFactory))
      throw Components.results.NS_ERROR_NO_INTERFACE;

    return this;
  },

  /* nsIFactory */
  createInstance: function comp_ci(aOuter, aIID) {
    if (aOuter != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;

    return this.QueryInterface(aIID);
  },

  lockFactory : function comp_lf(aLock) {}
};

function NSGetFactory(aCID) {
  if (Components.ID("{80edd604-4028-4c89-a1c1-6e1f25bfa5a7}").equals(aCID))
    return gComponent;

  throw Components.results.NS_ERROR_FACTORY_NOT_REGISTERED;
}
