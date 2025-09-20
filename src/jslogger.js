/*
 * ColorJSLogger
 * Lightweight JavaScript Logger for the browser and node.
 * It is a perfect logger that supports all browsers.
 * It allows to print color logs with pre-defined 5 levels of logging
 * It has a debug mode in which you can print logs during dev and then set it to false to avoid printing confidential logs during production
 * Website: https://github.com/suhaibjanjua/colorjslogger
 * Copyright: (c) 2019-2023 Suhaib Janjua
 * License: MIT
 */

/**
 * Formats a date object to a readable UTC string
 * @param {Date} now - The date object to format
 * @returns {string} Formatted date string
 */
const utc = (now) =>
  now.toDateString() +
  ' ' +
  ('0' + now.getHours()).slice(-2) +
  ':' +
  ('0' + now.getMinutes()).slice(-2) +
  ':' +
  ('0' + now.getSeconds()).slice(-2);

/**
 * jslogger - A colorful console logger with download capabilities
 */
const jslogger = {
  /**
   * Enable/disable verbose logging
   * @type {boolean}
   */
  VERBOSE: false,

  /**
   * Application name prefix for logs
   * @type {string}
   */
  appName: 'JSLogger',

  /**
   * Internal log storage for download functionality
   * @type {string}
   */
  objLogs: '',

  /**
   * Internal logging method
   * @param {string} process - The process/module name
   * @param {string} message - The log message
   * @param {string} level - The log level (info, debug, success, warning, error)
   * @private
   */
  _log(process, message, level) {
    const colorLevel = {
      info: 'black',
      debug: 'blue',
      success: 'green',
      warning: 'orange',
      error: 'red',
    };

    const printLog = `${utc(new Date())} | ${this.appName} | [${process}] :: ${message}`;
    this.objLogs += printLog + '\n';

    if (typeof console.log === 'function') {
      if (typeof console.log.apply === 'function') {
        console.log.apply(console, [
          `%c ${printLog}`,
          `color:${colorLevel[level]}`,
        ]);
      } else {
        console.log(`%c ${printLog}`, `color:${colorLevel[level]}`);
      }
    }
  },

  /**
   * Log an info message
   * @param {string} process - The process/module name
   * @param {string} message - The log message
   */
  info(process, message) {
    this._log(process, message, 'info');
  },

  /**
   * Log an error message
   * @param {string} process - The process/module name
   * @param {string} message - The log message
   */

  error(process, message) {
    this._log(process, message, 'error');
  },

  /**
   * Log a success message
   * @param {string} process - The process/module name
   * @param {string} message - The log message
   */
  success(process, message) {
    this._log(process, message, 'success');
  },

  /**
   * Log a warning message
   * @param {string} process - The process/module name
   * @param {string} message - The log message
   */
  warning(process, message) {
    this._log(process, message, 'warning');
  },

  /**
   * Log an internal message (stored but not displayed in console)
   * @param {string} process - The process/module name
   * @param {string} message - The log message
   */
  internal(process, message) {
    const printLog = `${utc(new Date())} | ${this.appName} | [${process}] :: ${message}`;
    this.objLogs += printLog + '\n';
  },

  /**
   * Log a debug message (only shown in verbose mode)
   * @param {string} process - The process/module name
   * @param {string} message - The log message
   */
  debug(process, message) {
    if (this.VERBOSE) {
      this._log(process, message, 'debug');
    } else {
      const printLog = `${utc(new Date())} | ${this.appName} | [${process}] :: ${message}`;
      this.objLogs += printLog + '\n';
    }
  },

  /**
   * Download all logs as a text file
   * @param {string} [filename] - Optional filename for the download
   */
  downloadLogs(filename) {
    // Check if we're in a browser environment
    if (typeof document === 'undefined') {
      console.warn(
        'jslogger: downloadLogs() is only available in browser environments'
      );
      return;
    }

    const a = document.createElement('a');
    const file = new Blob([this.objLogs], { type: 'text/plain' });
    a.href = URL.createObjectURL(file);
    a.download = filename || `${this.appName}-${utc(new Date())}.log`;
    a.click();

    // Clean up the object URL to prevent memory leaks
    setTimeout(() => URL.revokeObjectURL(a.href), 100);
  },

  /**
   * Enable or disable verbose logging
   * @param {boolean} isVerbose - Whether to enable verbose mode
   */
  setLevelToVerbose(isVerbose) {
    this.VERBOSE = Boolean(isVerbose);
  },

  /**
   * Set the application name prefix for all logs
   * @param {string} name - The application name
   */
  setAppName(name) {
    if (typeof name === 'string' && name.trim()) {
      this.appName = name.trim();
    } else {
      console.warn('jslogger: Invalid app name provided');
    }
  },

  /**
   * Get the current version
   * @returns {string} Version string
   */
  version() {
    return '3.0.2';
  },

  /**
   * Get information about the library
   * @returns {string} About information
   */
  about() {
    return 'Website: https://github.com/suhaibjanjua/colorjslogger \n Copyright: (c) 2019-2023 Suhaib Janjua';
  },

  /**
   * Clear all stored logs
   */
  clearLogs() {
    this.objLogs = '';
  },

  /**
   * Get all stored logs
   * @returns {string} All stored logs
   */
  getLogs() {
    return this.objLogs;
  },

  /**
   * Alias for info method
   * @param {string} process - The process/module name
   * @param {string} message - The log message
   */
  log(process, message) {
    this.info(process, message);
  },
};

// Browser compatibility check and warnings
try {
  if (
    typeof navigator !== 'undefined' &&
    (navigator.appName === 'Microsoft Internet Explorer' ||
      !!(
        navigator.userAgent.match(/Trident/) ||
        navigator.userAgent.match(/rv 11/)
      ))
  ) {
    jslogger.useIE11 = true;
    jslogger.warning(
      'Initialize',
      'Internet Explorer 11 detected. Some features may not work as expected. Consider upgrading to a modern browser.'
    );
  }
} catch (err) {
  // Silently handle environments where navigator is not available
  if (typeof console !== 'undefined' && console.warn) {
    console.warn('jslogger: Could not detect browser environment', err);
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  // CommonJS
  module.exports = jslogger;
} else if (typeof window !== 'undefined') {
  // Browser global
  window.ColorJSLogger = jslogger;
  // Also make it available as the old name for backward compatibility
  window.jslogger = jslogger;
}

// ES module export (will be handled by build tools)
export default jslogger;
