/**
 * ColorJSLogger - A colorful console logger with download capabilities
 */
declare interface ColorJSLogger {
  /**
   * Enable/disable verbose logging
   */
  VERBOSE: boolean;

  /**
   * Application name prefix for logs
   */
  appName: string;

  /**
   * Internal log storage for download functionality
   */
  objLogs: string;

  /**
   * Flag to indicate IE11 compatibility mode
   */
  useIE11?: boolean;

  /**
   * Log an info message
   * @param process - The process/module name
   * @param message - The log message
   */
  info(process: string, message: string): void;

  /**
   * Log an error message
   * @param process - The process/module name
   * @param message - The log message
   */
  error(process: string, message: string): void;

  /**
   * Log a success message
   * @param process - The process/module name
   * @param message - The log message
   */
  success(process: string, message: string): void;

  /**
   * Log a warning message
   * @param process - The process/module name
   * @param message - The log message
   */
  warning(process: string, message: string): void;

  /**
   * Log an internal message (stored but not displayed in console)
   * @param process - The process/module name
   * @param message - The log message
   */
  internal(process: string, message: string): void;

  /**
   * Log a debug message (only shown in verbose mode)
   * @param process - The process/module name
   * @param message - The log message
   */
  debug(process: string, message: string): void;

  /**
   * Alias for info method
   * @param process - The process/module name
   * @param message - The log message
   */
  log(process: string, message: string): void;

  /**
   * Download all logs as a text file
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
   * Get the current version
   */
  version(): string;

  /**
   * Get information about the library
   */
  about(): string;

  /**
   * Clear all stored logs
   */
  clearLogs(): void;

  /**
   * Get all stored logs
   */
  getLogs(): string;
}

declare const ColorJSLogger: ColorJSLogger;

export default ColorJSLogger;

// For backward compatibility
export { ColorJSLogger as jslogger };

// Global declarations for browser usage
declare global {
  interface Window {
    ColorJSLogger: ColorJSLogger;
    jslogger: ColorJSLogger;
  }
}