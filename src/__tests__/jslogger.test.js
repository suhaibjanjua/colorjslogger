/**
 * ColorJSLogger tests
 */

// Import the logger
const ColorJSLogger = require('../jslogger.js');

// Mock console methods
const originalConsole = global.console;

beforeEach(() => {
  // Reset the logger state
  ColorJSLogger.objLogs = '';
  ColorJSLogger.appName = 'ColorJSLogger';
  ColorJSLogger.VERBOSE = false;

  // Mock console.log
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    warn: jest.fn(),
  };
});

afterEach(() => {
  global.console = originalConsole;
});

describe('ColorJSLogger', () => {
  describe('Basic functionality', () => {
    test('should have correct initial values', () => {
      expect(ColorJSLogger.appName).toBe('ColorJSLogger');
      expect(ColorJSLogger.VERBOSE).toBe(false);
      expect(ColorJSLogger.objLogs).toBe('');
    });

    test('should return correct version', () => {
      expect(ColorJSLogger.version()).toBe('3.0.2');
    });

    test('should return correct about information', () => {
      const about = ColorJSLogger.about();
      expect(about).toContain('github.com/suhaibjanjua/colorjslogger');
      expect(about).toContain('2019-2023 Suhaib Janjua');
    });
  });

  describe('Logging methods', () => {
    test('should log info messages', () => {
      ColorJSLogger.info('TestModule', 'This is an info message');

      expect(console.log).toHaveBeenCalled();
      expect(ColorJSLogger.objLogs).toContain('TestModule');
      expect(ColorJSLogger.objLogs).toContain('This is an info message');
    });

    test('should log error messages', () => {
      ColorJSLogger.error('TestModule', 'This is an error message');

      expect(console.log).toHaveBeenCalled();
      expect(ColorJSLogger.objLogs).toContain('TestModule');
      expect(ColorJSLogger.objLogs).toContain('This is an error message');
    });

    test('should log success messages', () => {
      ColorJSLogger.success('TestModule', 'This is a success message');

      expect(console.log).toHaveBeenCalled();
      expect(ColorJSLogger.objLogs).toContain('TestModule');
      expect(ColorJSLogger.objLogs).toContain('This is a success message');
    });

    test('should log warning messages', () => {
      ColorJSLogger.warning('TestModule', 'This is a warning message');

      expect(console.log).toHaveBeenCalled();
      expect(ColorJSLogger.objLogs).toContain('TestModule');
      expect(ColorJSLogger.objLogs).toContain('This is a warning message');
    });

    test('should store internal messages without console output', () => {
      ColorJSLogger.internal('TestModule', 'This is an internal message');

      expect(console.log).not.toHaveBeenCalled();
      expect(ColorJSLogger.objLogs).toContain('TestModule');
      expect(ColorJSLogger.objLogs).toContain('This is an internal message');
    });

    test('should handle debug messages based on VERBOSE setting', () => {
      // Debug should not show in console when VERBOSE is false
      ColorJSLogger.debug('TestModule', 'This is a debug message');
      expect(console.log).not.toHaveBeenCalled();
      expect(ColorJSLogger.objLogs).toContain('This is a debug message');

      // Clear logs and enable verbose
      ColorJSLogger.clearLogs();
      ColorJSLogger.setLevelToVerbose(true);

      ColorJSLogger.debug('TestModule', 'This is a verbose debug message');
      expect(console.log).toHaveBeenCalled();
      expect(ColorJSLogger.objLogs).toContain(
        'This is a verbose debug message'
      );
    });

    test('log method should work as alias for info', () => {
      ColorJSLogger.log('TestModule', 'This is a log message');

      expect(console.log).toHaveBeenCalled();
      expect(ColorJSLogger.objLogs).toContain('TestModule');
      expect(ColorJSLogger.objLogs).toContain('This is a log message');
    });
  });

  describe('Configuration methods', () => {
    test('should set app name correctly', () => {
      ColorJSLogger.setAppName('MyApp');
      expect(ColorJSLogger.appName).toBe('MyApp');

      // Test logging with new app name
      ColorJSLogger.info('TestModule', 'Test message');
      expect(ColorJSLogger.objLogs).toContain('MyApp');
    });

    test('should handle invalid app names', () => {
      ColorJSLogger.setAppName('');
      expect(console.warn).toHaveBeenCalled();

      ColorJSLogger.setAppName(null);
      expect(console.warn).toHaveBeenCalled();
    });

    test('should set verbose level correctly', () => {
      ColorJSLogger.setLevelToVerbose(true);
      expect(ColorJSLogger.VERBOSE).toBe(true);

      ColorJSLogger.setLevelToVerbose(false);
      expect(ColorJSLogger.VERBOSE).toBe(false);

      // Test with non-boolean values
      ColorJSLogger.setLevelToVerbose('true');
      expect(ColorJSLogger.VERBOSE).toBe(true);

      ColorJSLogger.setLevelToVerbose(0);
      expect(ColorJSLogger.VERBOSE).toBe(false);
    });
  });

  describe('Log management', () => {
    test('should clear logs correctly', () => {
      ColorJSLogger.info('TestModule', 'Test message');
      expect(ColorJSLogger.objLogs).not.toBe('');

      ColorJSLogger.clearLogs();
      expect(ColorJSLogger.objLogs).toBe('');
    });

    test('should get logs correctly', () => {
      ColorJSLogger.info('TestModule', 'Test message');
      const logs = ColorJSLogger.getLogs();

      expect(logs).toContain('TestModule');
      expect(logs).toContain('Test message');
      expect(logs).toBe(ColorJSLogger.objLogs);
    });
  });

  describe('Download functionality', () => {
    test('should warn when download is called in non-browser environment', () => {
      ColorJSLogger.downloadLogs();
      expect(console.warn).toHaveBeenCalledWith(
        'ColorJSLogger: downloadLogs() is only available in browser environments'
      );
    });

    // Browser-specific tests would need a different test environment
    // These would be tested in integration tests or browser-specific test suites
  });
});
