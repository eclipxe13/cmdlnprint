/* jshint moz: true */

let cmdlineprint;

function startup(data) {
    cmdlineprint = Components.utils.import('resource://cmdlnprint/components/cmdlnprint.jsm', {});
    cmdlineprint.startup();
}

function shutdown(data, reason) {
    cmdlineprint.shutdown();
}

function install() {
}

function uninstall() {
}
