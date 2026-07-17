/**
 * ColorJSLogger — robustness guards
 *
 * SECURITY.md declares ReDoS in the redaction patterns to be in scope, and
 * declares a bounded buffer to be a guarantee. These are the tests that make
 * those claims something other than words.
 */

const ColorJSLogger = require('../jslogger.js');
const pkg = require('../../package.json');

const originalConsole = global.console;

beforeEach(() => {
  ColorJSLogger.clearLogs();
  ColorJSLogger.resetRedaction();
  ColorJSLogger.setMaxEntries(2000);
  global.console = { ...originalConsole, log: jest.fn(), warn: jest.fn() };
});

afterEach(() => {
  global.console = originalConsole;
});

/** Wall-clock a single log call. */
const timeLog = (message) => {
  const start = process.hrtime.bigint();
  ColorJSLogger.internal('Perf', message);
  return Number(process.hrtime.bigint() - start) / 1e6;
};

describe('Redaction patterns are not ReDoS-able', () => {
  // Each input targets a specific pattern with the shape a backtracking
  // engine would choke on. A vulnerable pattern blows past the budget by
  // orders of magnitude, so the threshold does not need to be tight.
  const BUDGET_MS = 500;

  test.each([
    ['long key-shape run', 'token=' + 'a'.repeat(50000)],
    ['many key-value pairs', 'token=abc123456&'.repeat(5000)],
    ['unterminated quote', 'password="' + 'a'.repeat(50000)],
    ['JWT-like prefix, never completing', 'eyJ' + 'a'.repeat(50000)],
    ['JWT-like with dots', 'eyJ' + 'a.'.repeat(20000)],
    ['Bearer with a huge value', 'Bearer ' + 'A'.repeat(50000)],
    ['Basic with a huge value', 'Basic ' + 'A'.repeat(50000)],
    ['whitespace flood before a separator', 'token' + ' '.repeat(50000) + '=x'],
    ['redaction-marker flood', '[REDACTED] '.repeat(20000)],
    ['colon flood', ':'.repeat(50000)],
    ['quote flood', '"'.repeat(50000)],
  ])('%s completes within budget', (_label, input) => {
    expect(timeLog(input)).toBeLessThan(BUDGET_MS);
  });

  test('a pathological input is still redacted correctly', () => {
    // Guard against "fast because it silently stopped matching".
    ColorJSLogger.internal('Perf', 'token=' + 'a'.repeat(10000));
    expect(ColorJSLogger.getLogs()).toContain('token=[REDACTED]');
    expect(ColorJSLogger.getLogs()).not.toContain('aaaaaaaaaa');
  });
});

describe('Deeply nested objects do not blow the stack', () => {
  test('handles a 1000-level nested object', () => {
    let deep = { password: 'hunter2' };
    for (let i = 0; i < 1000; i++) deep = { nested: deep };

    expect(() => ColorJSLogger.internal('Deep', deep)).not.toThrow();
    expect(ColorJSLogger.getLogs()).not.toContain('hunter2');
  });

  test('handles a wide array', () => {
    const wide = Array.from({ length: 10000 }, (_, i) => ({
      i,
      token: `t-${i}`,
    }));

    expect(() => ColorJSLogger.internal('Wide', wide)).not.toThrow();
    expect(ColorJSLogger.getLogs()).not.toContain('t-500');
  });
});

describe('Odd message types do not throw', () => {
  test.each([
    ['null', null],
    ['undefined', undefined],
    ['number', 42],
    ['boolean', true],
    ['empty string', ''],
    ['a Date', new Date('2020-01-01T00:00:00Z')],
    ['an Error', new Error('boom')],
    ['a RegExp', /token=(.*)/],
    ['an empty object', {}],
    ['an empty array', []],
  ])('%s', (_label, message) => {
    expect(() => ColorJSLogger.internal('Odd', message)).not.toThrow();
    expect(ColorJSLogger.getEntryCount()).toBe(1);
  });

  test('an object with a throwing getter degrades gracefully', () => {
    const hostile = {
      get boom() {
        throw new Error('nope');
      },
    };
    expect(() => ColorJSLogger.internal('Odd', hostile)).not.toThrow();
    expect(ColorJSLogger.getEntryCount()).toBe(1);
  });
});

describe('version() does not drift from package.json', () => {
  test('matches the published version', () => {
    // version() is hardcoded in the source because the bundle cannot read
    // package.json at runtime. This is the only thing keeping the two in sync;
    // they have drifted before (4.0.0 vs 4.0.4).
    expect(ColorJSLogger.version()).toBe(pkg.version);
  });
});
