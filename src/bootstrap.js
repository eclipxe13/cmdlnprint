/* jshint moz: true */

const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");

let cmdlineprint;

function startup(data) {
  cmdlineprint = Cu.import("resource://cmdlnprint/components/cmdlnprint.jsm", {});
  cmdlineprint.startup();
}

function shutdown(data, reason) {
  cmdlineprint = Cu.import("resource://cmdlnprint/components/cmdlnprint.jsm", {});
  cmdlineprint.shutdown();
}

function install() {
}

function uninstall() {
}
