/*
 * JS Logger
 * Lightweight JavaScript Logger for the browser and node.
 * It is a perfect logger that supports all browsers.
 * It allows to print color logs with pre-defined 5 levels of logging
 * It has a debug mode in which you can print logs during dev and then set it to false to avoid printing confidential logs during production
 * Website: https://github.com/suhaibjanjua/colorjslogger
 * Copyright: (c) 2019 Suhaib Janjua
 * License: MIT
 */
const utc = (now) =>
    now.toDateString() +
    " " +
    ("0" + now.getHours()).slice(-2) +
    ":" +
    ("0" + now.getMinutes()).slice(-2) +
    ":" +
    ("0" + now.getSeconds()).slice(-2);

const jslogger = {
    VERBOSE: false,
    appName: 'JSLOGGER',
    objLogs: '',

    _log(process, message, level) {
        const colorLevel = {
            "info": "black",
            "debug": "blue",
            "success": "green",
            "warning": "orange",
            "error": "red"
        };

        const printLog = `${utc(new Date())} | ${this.appName} | [${process}] :: ${message}`;
        this.objLogs += printLog + "\n";

        if (typeof console.log === "function") {
            if (typeof console.log.apply === "function") {
                console.log.apply(console, [`%c ${printLog}`, `color:${colorLevel[level]}`]);
            } else {
                console.log(`%c ${printLog}`, `color:${colorLevel[level]}`);
            }
        }
    },

    info(process, message) {
        this._log(process, message, "info");
    },

    error(process, message) {
        this._log(process, message, "error");
    },

    success(process, message) {
        this._log(process, message, "success");
    },

    warning(process, message) {
        this._log(process, message, "warning");
    },

    internal(process, message) {
        const printLog = `${utc(new Date())} | ${this.appName} | [${process}] :: ${message}`;
        this.objLogs += printLog + "\n";
    },

    debug(process, message) {
        if (this.VERBOSE) {
            this._log(process, message, "debug");
        } else {
            const printLog = `${utc(new Date())} | ${this.appName} | [${process}] :: ${message}`;
            this.objLogs += printLog + "\n";
        }
    },

    downloadLogs() {
        const a = document.createElement('a');
        const file = new Blob([this.objLogs], { type: 'text/plain' });
        a.href = URL.createObjectURL(file);
        a.download = `${this.appName}-${utc(new Date())}.log`;
        a.click();
    },

    setLevelToVerbose(isVerbose) {
        this.VERBOSE = isVerbose;
    },

    setAppName(name) {
        this.appName = name;
    },

    version() {
        return "1.4.0";
    },

    about() {
        return "Website: https://github.com/suhaibjanjua/colorjslogger \n Copyright: (c) 2019 Suhaib Janjua";
    },
};

try {
    if (navigator.appName === "Microsoft Internet Explorer" || !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv 11/))) {
        jslogger.useIE11 = true;
        jslogger.warning("Initialize ", "Internet Explorer 11 detected. You need to load ES6-shim in order to work (IE11-compat)");
    }
} catch (err) {
    console.log("Please ignore it...", err);
}

export default jslogger;