/* jshint moz: true */

const Cu = Components.utils;

let cmdlineprint;

function startup(data) {
    cmdlineprint = Cu.import("resource://cmdlnprint/components/cmdlnprint.jsm", {});
    cmdlineprint.startup();
}

function shutdown(data, reason) {
    cmdlineprint.shutdown();
}

function install() {
}

function uninstall() {
}
