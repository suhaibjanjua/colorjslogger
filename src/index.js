var pjson = require('./package.json');

var useIE11 = false;
var VERBOSE = false;
var isBrowser;
var console;

if (typeof global !== "undefined" && global.console) {
    isBrowser = false;
    console = global.console;
} else if (typeof window !== "undefined" && window.console) {
    isBrowser = true;
    console = window.console;
} else {
    isBrowser = false;
    console = {}
}


var utc = function utc(now) {
    var datestring = now.toDateString() + " " + ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2) + ":" + ("0" + now.getSeconds()).slice(-2);
    return datestring;
};

var _log = function _log(fname, msg, level) {
    var colorLevel = {
        "info": "black",
        "debug": "blue",
        "success": "green",
        "warning": "orange",
        "error": "red"
    };
    if (!isBrowser) {
        console.log(utc(new Date()) + " | JSLOGGER | " + "[" + fname + "] :: " + msg);
    } else {
        console.log("%c " + utc(new Date()) + " | JSLOGGER | " + "[" + fname + "] :: " + msg, "color:" + colorLevel[level]);
    }
};

exports.info = function info(fname, msg) {
    _log(fname, msg, "info");
};

exports.error = function error(fname, msg) {
    _log(fname, msg, "error");
};

exports.success = function success(fname, msg) {
    _log(fname, msg, "success");
};

exports.warning = function warning(fname, msg) {
    _log(fname, msg, "warning");
};

exports.internal = function warning(fname, msg) {
    var printLog = utc(new Date()) + " | " + appName + " | " + "[" + fname + "] :: " + msg;
    objLogs += printLog + "\n";
};

exports.debug = function debug(fname, msg) {
    if (VERBOSE) {
        _log(fname, msg, "debug");
    } else {
        var printLog = utc(new Date()) + " | " + appName + " | " + "[" + fname + "] :: " + msg;
        objLogs += printLog + "\n";
    }
};

exports.downloadLogs = function downloadLogs() {
    var a = document.createElement('a');
    var file = new Blob([objLogs], { type: 'text/plain' });
    a.href = URL.createObjectURL(file);
    a.download = appName + "-" + utc(new Date()) + ".log";
    a.click();
};

exports.setLevelToVerbose = function setLevelToVerbose(isVerbose) {
    VERBOSE = isVerbose;
};

exports.setAppName = function setAppName(name) {
    appName = name;
};

exports.version = function version(name) {
    return pjson.version;
};

exports.about = function about() {
    return "Website: https://github.com/suhaibjanjua/js-logger \n Copyright: (c) 2019 Suhaib Janjua"
};

if (navigator.appName === "Microsoft Internet Explorer" || !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv 11/))) {
    //window.Promise = window.ES6Promise;
    useIE11 = true;
    logger.warning("Initialize ", "Internet Explorer 11 detected. You need to load ES6-shim in order to work (IE11-compat)");
}