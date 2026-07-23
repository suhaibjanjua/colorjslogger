/**
 * A value acceptable as a log message. Strings pass through the capture-time
 * string scan; objects and arrays are additionally key-redacted before
 * serialisation.
 */
export type LogMessage =
  | string
  | number
  | boolean
  | object
  | null
  | undefined;

/**
 * Redaction policy mode.
 * - 'blacklist': deny-listed keys are redacted. Default, safe with no config.
 * - 'whitelist': only allow-listed keys survive; everything else is redacted.
 */
export type RedactionMode = 'blacklist' | 'whitelist';

/**
 * ColorJSLogger - A colorful console logger with download capabilities
 */
export interface ColorJSLoggerStatic {
  /**
   * Enable/disable verbose logging
   */
  VERBOSE: boolean;

  /**
   * Application name prefix for logs
   */
  appName: string;

  /**
   * Legacy accessor for the log buffer. Reads return the retained window.
   * @deprecated Use getLogs() to read and clearLogs() to reset. Writes are
   * ignored with a console warning, except `objLogs = ''` which clears.
   */
  objLogs: string;

  /**
   * Flag to indicate IE11 compatibility mode
   */
  useIE11?: boolean;

  /**
   * Log an info message
   * @param process - The process/module name
   * @param message - The log message. Objects are key-redacted then serialised.
   */
  info(process: string, message: LogMessage): void;

  /**
   * Log an error message
   * @param process - The process/module name
   * @param message - The log message
   */
  error(process: string, message: LogMessage): void;

  /**
   * Log a success message
   * @param process - The process/module name
   * @param message - The log message
   */
  success(process: string, message: LogMessage): void;

  /**
   * Log a warning message
   * @param process - The process/module name
   * @param message - The log message
   */
  warning(process: string, message: LogMessage): void;

  /**
   * Log an internal message (buffered, never printed to the console).
   *
   * NOT a security feature by itself - it only suppresses console output. The
   * entry still enters the buffer and still appears in downloadLogs(). What
   * protects it is the capture-time redaction that every log method shares.
   *
   * @param process - The process/module name
   * @param message - The log message
   */
  internal(process: string, message: LogMessage): void;

  /**
   * Log a debug message (only printed to the console in verbose mode; always
   * buffered)
   * @param process - The process/module name
   * @param message - The log message
   */
  debug(process: string, message: LogMessage): void;

  /**
   * Alias for info method
   * @param process - The process/module name
   * @param message - The log message
   */
  log(process: string, message: LogMessage): void;

  /**
   * Download the retained logs as a text file. No-ops with a console warning
   * outside a browser.
   * @param filename - Optional filename for the download
   */
  downloadLogs(filename?: string): void;

  /**
   * Enable or disable verbose logging
   * @param isVerbose - Whether to enable verbose mode
   */
  setLevelToVerbose(isVerbose: boolean): void;

  /**
   * Set the application name prefix for all logs
   * @param name - The application name
   */
  setAppName(name: string): void;

  /**
   * Set how many log entries are retained before the oldest are evicted.
   * Values that are non-numeric, non-finite or <= 0 are rejected with a
   * console warning and leave the current cap untouched.
   * @param n - Positive integer entry cap (default 10000)
   */
  setMaxEntries(n: number): void;

  /**
   * Get the current retained-entry cap
   */
  getMaxEntries(): number;

  /**
   * Get the number of currently retained entries
   */
  getEntryCount(): number;

  /**
   * Extend the redaction deny-list. Strings match case-insensitively as
   * substrings ('ssn' also catches 'user_ssn'); pass a RegExp for exact
   * control.
   * @param keys - Keys or patterns to redact
   */
  addRedactedKeys(keys: Array<string | RegExp>): void;

  /**
   * Choose the redaction mode. The library supplies the mechanism; which mode
   * you run is your policy call. Pair 'whitelist' with setAllowedKeys().
   * @param mode - 'blacklist' (default, safe out of the box) or 'whitelist'
   */
  setRedactionMode(mode: RedactionMode): void;

  /**
   * Set the allow-list consulted in whitelist mode. Entries match the whole
   * key, case-insensitively. No effect in blacklist mode.
   * @param keys - Keys permitted to survive into the buffer
   */
  setAllowedKeys(keys: Array<string | RegExp>): void;

  /**
   * Reset redaction to the built-in blacklist defaults.
   */
  resetRedaction(): void;

  /**
   * Get the current version
   */
  version(): string;

  /**
   * Get information about the library
   */
  about(): string;

  /**
   * Clear all retained logs
   */
  clearLogs(): void;

  /**
   * Get all retained logs, oldest first
   */
  getLogs(): string;
}

declare const ColorJSLogger: ColorJSLoggerStatic;

export default ColorJSLogger;

// For backward compatibility
export { ColorJSLogger as jslogger };

// Global declarations for browser (script tag / UMD) usage
declare global {
  interface Window {
    ColorJSLogger: ColorJSLoggerStatic;
    jslogger: ColorJSLoggerStatic;
  }
}
