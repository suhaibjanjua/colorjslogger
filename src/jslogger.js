/*
 * ColorJSLogger
 * Lightweight JavaScript Logger for the browser and node.
 * It is a perfect logger that supports all browsers.
 * It allows to print color logs with pre-defined 5 levels of logging
 * It has a debug mode in which you can print logs during dev and then set it to false to avoid printing confidential logs during production
 * Website: https://github.com/suhaibjanjua/colorjslogger
 * Copyright: (c) 2019-2025 Suhaib Janjua
 * License: MIT
 */

import {
  defaultConfig,
  redactValue,
  scrubString,
  toKeyPattern,
} from './redact.js';

/**
 * Default cap on retained log entries.
 * @type {number}
 */
const DEFAULT_MAX_ENTRIES = 2000;

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
 * ColorJSLogger - A colorful console logger with download capabilities
 */
const ColorJSLogger = {
  /**
   * Enable/disable verbose logging
   * @type {boolean}
   */
  VERBOSE: false,

  /**
   * Application name prefix for logs
   * @type {string}
   */
  appName: 'ColorJSLogger',

  /**
   * Retained log entries, oldest first. Bounded by _maxEntries.
   * @type {string[]}
   * @private
   */
  _entries: [],

  /**
   * Maximum retained entries before the oldest are evicted.
   * @type {number}
   * @private
   */
  _maxEntries: DEFAULT_MAX_ENTRIES,

  /**
   * Active redaction policy.
   * @private
   */
  _redaction: defaultConfig(),

  /**
   * Legacy accessor for the log buffer.
   *
   * Was a plain string property before v5. Reads still work and return the
   * retained window joined by newlines. Writes cannot be honoured — entries
   * are structured now — so only the historical `objLogs = ''` idiom is
   * supported, as an alias for clearLogs().
   *
   * @type {string}
   * @deprecated Use getLogs() to read and clearLogs() to reset.
   */
  get objLogs() {
    return this._entries.length ? this._entries.join('\n') + '\n' : '';
  },

  set objLogs(value) {
    if (!value) {
      this.clearLogs();
      return;
    }
    console.warn(
      'ColorJSLogger: objLogs is read-only; use clearLogs() to reset the buffer'
    );
  },

  /**
   * Renders a caller-supplied message into a loggable string.
   *
   * Objects and arrays are key-redacted BEFORE serialisation, so no raw value
   * from a sensitive key is ever rendered. Redaction returns a clone with
   * circular references broken, which is what makes JSON.stringify safe here.
   *
   * @param {*} message - String, object, array, or primitive
   * @returns {string}
   * @private
   */
  _render(message) {
    if (typeof message === 'string') return message;
    if (message !== null && typeof message === 'object') {
      try {
        return JSON.stringify(redactValue(message, this._redaction));
      } catch (err) {
        return `[Unserializable: ${err.message}]`;
      }
    }
    return String(message);
  },

  /**
   * THE choke point. Every log entry in this library is composed, redacted,
   * and buffered here and nowhere else.
   *
   * SECURITY INVARIANT: redaction happens HERE, at capture, before the push
   * to _entries. The buffer, getLogs(), downloadLogs() and the console are
   * all strictly downstream of it and all observe the same redacted string.
   * There is no code path that retains a raw sensitive value after the call
   * returns. Do not add a fourth formatter — route through this.
   *
   * @param {string} process - The process/module name
   * @param {*} message - The log message
   * @param {string} [level] - Console colour key; omit to skip console output
   * @private
   */
  _write(process, message, level) {
    const entry = scrubString(
      `${utc(new Date())} | ${this.appName} | [${process}] :: ${this._render(
        message
      )}`,
      this._redaction
    );

    this._entries.push(entry);
    // ponytail: shift() per overflow is O(n) on a 2000-slot array and has
    // never shown up in a profile. Swap for head/tail index arithmetic only
    // if a real workload says otherwise.
    while (this._entries.length > this._maxEntries) {
      this._entries.shift();
    }

    if (!level) return;

    const colorLevel = {
      info: 'black',
      debug: 'blue',
      success: 'green',
      warning: 'orange',
      error: 'red',
    };

    if (typeof console.log === 'function') {
      if (typeof console.log.apply === 'function') {
        console.log.apply(console, [
          `%c ${entry}`,
          `color:${colorLevel[level]}`,
        ]);
      } else {
        console.log(`%c ${entry}`, `color:${colorLevel[level]}`);
      }
    }
  },

  /**
   * Log an info message
   * @param {string} process - The process/module name
   * @param {string|object} message - The log message
   */
  info(process, message) {
    this._write(process, message, 'info');
  },

  /**
   * Log an error message
   * @param {string} process - The process/module name
   * @param {string|object} message - The log message
   */
  error(process, message) {
    this._write(process, message, 'error');
  },

  /**
   * Log a success message
   * @param {string} process - The process/module name
   * @param {string|object} message - The log message
   */
  success(process, message) {
    this._write(process, message, 'success');
  },

  /**
   * Log a warning message
   * @param {string} process - The process/module name
   * @param {string|object} message - The log message
   */
  warning(process, message) {
    this._write(process, message, 'warning');
  },

  /**
   * Log an internal message (buffered, never printed to the console).
   *
   * NOT a security feature on its own: this only suppresses console output.
   * The entry still enters the buffer and still appears in downloadLogs().
   * What protects it is the capture-time redaction in _write(), which every
   * log method shares.
   *
   * @param {string} process - The process/module name
   * @param {string|object} message - The log message
   */
  internal(process, message) {
    this._write(process, message);
  },

  /**
   * Log a debug message (only printed to the console in verbose mode)
   * @param {string} process - The process/module name
   * @param {string|object} message - The log message
   */
  debug(process, message) {
    this._write(process, message, this.VERBOSE ? 'debug' : undefined);
  },

  /**
   * Download the retained logs as a text file
   * @param {string} [filename] - Optional filename for the download
   */
  downloadLogs(filename) {
    // Check if we're in a browser environment
    if (typeof document === 'undefined') {
      console.warn(
        'ColorJSLogger: downloadLogs() is only available in browser environments'
      );
      return;
    }

    const a = document.createElement('a');
    const file = new Blob([this.getLogs()], { type: 'text/plain' });
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
      console.warn('ColorJSLogger: Invalid app name provided');
    }
  },

  /**
   * Set how many log entries are retained before the oldest are evicted.
   * @param {number} n - Positive integer entry cap
   */
  setMaxEntries(n) {
    if (typeof n !== 'number' || !Number.isFinite(n) || n <= 0) {
      console.warn(
        'ColorJSLogger: setMaxEntries() expects a positive number; ignoring'
      );
      return;
    }
    this._maxEntries = Math.floor(n);
    if (this._entries.length > this._maxEntries) {
      this._entries.splice(0, this._entries.length - this._maxEntries);
    }
  },

  /**
   * Get the current retained-entry cap
   * @returns {number}
   */
  getMaxEntries() {
    return this._maxEntries;
  },

  /**
   * Get the number of currently retained entries
   * @returns {number}
   */
  getEntryCount() {
    return this._entries.length;
  },

  /**
   * Extend the redaction deny-list.
   *
   * Strings are matched case-insensitively as substrings, so 'ssn' also
   * catches 'user_ssn'. Pass a RegExp for exact control.
   *
   * @param {Array<string|RegExp>} keys - Keys or patterns to redact
   */
  addRedactedKeys(keys) {
    if (!Array.isArray(keys)) {
      console.warn('ColorJSLogger: addRedactedKeys() expects an array');
      return;
    }
    for (const key of keys) {
      const pattern = toKeyPattern(key);
      if (pattern) {
        this._redaction.keyPatterns.push(pattern);
      } else {
        console.warn('ColorJSLogger: ignoring invalid redaction key', key);
      }
    }
  },

  /**
   * Choose the redaction mode.
   *
   * The library supplies the mechanism; which mode you run is your policy
   * call. 'blacklist' is the safe-by-default mode and needs no configuration.
   * 'whitelist' is stricter but only as good as the allow-list you pair with
   * it — set that via setAllowedKeys() BEFORE switching, or every logged
   * object field will come out redacted.
   *
   * @param {'blacklist'|'whitelist'} mode
   */
  setRedactionMode(mode) {
    if (mode !== 'blacklist' && mode !== 'whitelist') {
      console.warn(
        "ColorJSLogger: setRedactionMode() expects 'blacklist' or 'whitelist'"
      );
      return;
    }
    this._redaction.mode = mode;
  },

  /**
   * Set the allow-list consulted in whitelist mode. Entries match the whole
   * key, case-insensitively. Has no effect in blacklist mode.
   *
   * @param {Array<string|RegExp>} keys - Keys permitted to survive
   */
  setAllowedKeys(keys) {
    if (!Array.isArray(keys)) {
      console.warn('ColorJSLogger: setAllowedKeys() expects an array');
      return;
    }
    this._redaction.allowedKeys = keys
      .map((key) =>
        key instanceof RegExp
          ? key
          : typeof key === 'string' && key.trim()
            ? new RegExp(
                `^${key.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
                'i'
              )
            : null
      )
      .filter(Boolean);
  },

  /**
   * Reset redaction to the built-in blacklist defaults.
   */
  resetRedaction() {
    this._redaction = defaultConfig();
  },

  /**
   * Get the current version
   * @returns {string} Version string
   */
  version() {
    return '5.0.0';
  },

  /**
   * Get information about the library
   * @returns {string} About information
   */
  about() {
    return 'Website: https://github.com/suhaibjanjua/colorjslogger \n Copyright: (c) 2019-2025 Suhaib Janjua';
  },

  /**
   * Clear all stored logs
   */
  clearLogs() {
    this._entries = [];
  },

  /**
   * Get all retained logs
   * @returns {string} The retained window, oldest first
   */
  getLogs() {
    return this.objLogs;
  },

  /**
   * Alias for info method
   * @param {string} process - The process/module name
   * @param {string|object} message - The log message
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
    ColorJSLogger.useIE11 = true;
    ColorJSLogger.warning(
      'Initialize',
      'Internet Explorer 11 detected. Some features may not work as expected. Consider upgrading to a modern browser.'
    );
  }
} catch (err) {
  // Silently handle environments where navigator is not available
  if (typeof console !== 'undefined' && console.warn) {
    console.warn('ColorJSLogger: Could not detect browser environment', err);
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  // CommonJS
  module.exports = ColorJSLogger;
} else if (typeof window !== 'undefined') {
  // Browser global
  window.ColorJSLogger = ColorJSLogger;
  // Also make it available as the old name for backward compatibility
  window.jslogger = ColorJSLogger;
}

// ES module export (will be handled by build tools)
export default ColorJSLogger;
