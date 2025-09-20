/**
 * jslogger tests
 */

// Import the logger
const jslogger = require('../jslogger.js');

// Mock console methods
const originalConsole = global.console;

beforeEach(() => {
  // Reset the logger state
  jslogger.objLogs = '';
  jslogger.appName = 'JSLogger';
  jslogger.VERBOSE = false;

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

describe('jslogger', () => {
  describe('Basic functionality', () => {
    test('should have correct initial values', () => {
      expect(jslogger.appName).toBe('JSLogger');
      expect(jslogger.VERBOSE).toBe(false);
      expect(jslogger.objLogs).toBe('');
    });

    test('should return correct version', () => {
      expect(jslogger.version()).toBe('3.0.2');
    });

    test('should return correct about information', () => {
      const about = jslogger.about();
      expect(about).toContain('github.com/suhaibjanjua/colorjslogger');
      expect(about).toContain('2019-2023 Suhaib Janjua');
    });
  });

  describe('Logging methods', () => {
    test('should log info messages', () => {
      jslogger.info('TestModule', 'This is an info message');

      expect(console.log).toHaveBeenCalled();
      expect(jslogger.objLogs).toContain('TestModule');
      expect(jslogger.objLogs).toContain('This is an info message');
    });

    test('should log error messages', () => {
      jslogger.error('TestModule', 'This is an error message');

      expect(console.log).toHaveBeenCalled();
      expect(jslogger.objLogs).toContain('TestModule');
      expect(jslogger.objLogs).toContain('This is an error message');
    });

    test('should log success messages', () => {
      jslogger.success('TestModule', 'This is a success message');

      expect(console.log).toHaveBeenCalled();
      expect(jslogger.objLogs).toContain('TestModule');
      expect(jslogger.objLogs).toContain('This is a success message');
    });

    test('should log warning messages', () => {
      jslogger.warning('TestModule', 'This is a warning message');

      expect(console.log).toHaveBeenCalled();
      expect(jslogger.objLogs).toContain('TestModule');
      expect(jslogger.objLogs).toContain('This is a warning message');
    });

    test('should store internal messages without console output', () => {
      jslogger.internal('TestModule', 'This is an internal message');

      expect(console.log).not.toHaveBeenCalled();
      expect(jslogger.objLogs).toContain('TestModule');
      expect(jslogger.objLogs).toContain('This is an internal message');
    });

    test('should handle debug messages based on VERBOSE setting', () => {
      // Debug should not show in console when VERBOSE is false
      jslogger.debug('TestModule', 'This is a debug message');
      expect(console.log).not.toHaveBeenCalled();
      expect(jslogger.objLogs).toContain('This is a debug message');

      // Clear logs and enable verbose
      jslogger.clearLogs();
      jslogger.setLevelToVerbose(true);

      jslogger.debug('TestModule', 'This is a verbose debug message');
      expect(console.log).toHaveBeenCalled();
      expect(jslogger.objLogs).toContain('This is a verbose debug message');
    });

    test('log method should work as alias for info', () => {
      jslogger.log('TestModule', 'This is a log message');

      expect(console.log).toHaveBeenCalled();
      expect(jslogger.objLogs).toContain('TestModule');
      expect(jslogger.objLogs).toContain('This is a log message');
    });
  });

  describe('Configuration methods', () => {
    test('should set app name correctly', () => {
      jslogger.setAppName('MyApp');
      expect(jslogger.appName).toBe('MyApp');

      // Test logging with new app name
      jslogger.info('TestModule', 'Test message');
      expect(jslogger.objLogs).toContain('MyApp');
    });

    test('should handle invalid app names', () => {
      jslogger.setAppName('');
      expect(console.warn).toHaveBeenCalled();

      jslogger.setAppName(null);
      expect(console.warn).toHaveBeenCalled();
    });

    test('should set verbose level correctly', () => {
      jslogger.setLevelToVerbose(true);
      expect(jslogger.VERBOSE).toBe(true);

      jslogger.setLevelToVerbose(false);
      expect(jslogger.VERBOSE).toBe(false);

      // Test with non-boolean values
      jslogger.setLevelToVerbose('true');
      expect(jslogger.VERBOSE).toBe(true);

      jslogger.setLevelToVerbose(0);
      expect(jslogger.VERBOSE).toBe(false);
    });
  });

  describe('Log management', () => {
    test('should clear logs correctly', () => {
      jslogger.info('TestModule', 'Test message');
      expect(jslogger.objLogs).not.toBe('');

      jslogger.clearLogs();
      expect(jslogger.objLogs).toBe('');
    });

    test('should get logs correctly', () => {
      jslogger.info('TestModule', 'Test message');
      const logs = jslogger.getLogs();

      expect(logs).toContain('TestModule');
      expect(logs).toContain('Test message');
      expect(logs).toBe(jslogger.objLogs);
    });
  });

  describe('Download functionality', () => {
    test('should warn when download is called in non-browser environment', () => {
      jslogger.downloadLogs();
      expect(console.warn).toHaveBeenCalledWith(
        'jslogger: downloadLogs() is only available in browser environments'
      );
    });

    // Browser-specific tests would need a different test environment
    // These would be tested in integration tests or browser-specific test suites
  });
});
