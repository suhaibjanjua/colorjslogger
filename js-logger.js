/*
 * JS Logger
 * Lightweight JavaScript Logger for the browser and node.
 * It is a perfect logger that supports all browsers.
 * It allows to print color logs with pre-defined 5 levels of logging
 * It has a debug mode in which you can print logs during dev and then set it to false to avoid printing confidential logs during production
 * Website: https://github.com/suhaibjanjua/js-logger
 * Copyright: (c) 2019 Suhaib Janjua
 * License: MIT
 */
try {
    var useIE11 = false;

    var utc = function utc(now) {
        var datestring = now.toDateString() + " " + ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2) + ":" + ("0" + now.getSeconds()).slice(-2);
        return datestring;
    };

    var jslogger = new function(name = 'JSLogger') {

        var VERBOSE = false;

        var _log = function _log(process, message, level) {
            var colorLevel = {
                "info": "black",
                "debug": "blue",
                "success": "green",
                "warning": "orange",
                "error": "red"
            };
            if (useIE11) {
                console.log(utc(new Date()) + " | " + name + " | " + "[" + process + "] :: " + message);
            } else {
                console.log("%c " + utc(new Date()) + " | " + name + " | " + "[" + process + "] :: " + message, "color:" + colorLevel[level]);
            }
        };

        this.info = function info(process, message) {
            _log(process, message, "info");
        };

        this.error = function error(process, message) {
            _log(process, message, "error");
        };

        this.success = function success(process, message) {
            _log(process, message, "success");
        };

        this.warning = function warning(process, message) {
            _log(process, message, "warning");
        };

        this.debug = function debug(process, message) {
            if (VERBOSE) {
                _log(process, message, "debug");
            }
        };

        this.setLevelToVerbose = function setLevelToVerbose(isVerbose) {
            VERBOSE = isVerbose;
        };

    };

    if (navigator.appName === "Microsoft Internet Explorer" || !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv 11/))) {
        //window.Promise = window.ES6Promise;
        useIE11 = true;
        jslogger.warning("Initialize ", "Internet Explorer 11 detected. You need to load ES6-shim in order to work (IE11-compat)");
    }
} catch (err) {
    console.log("If you see that... Just go away from that code :-)", err);
}