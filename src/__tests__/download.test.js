/**
 * ColorJSLogger — downloadLogs() browser-path tests
 *
 * @jest-environment jsdom
 *
 * The node-env suites cover downloadLogs()'s guard clause. This one drives the
 * real browser path and — most importantly — reads back what actually lands in
 * the Blob, which is the artifact that leaves the user's machine.
 */

const ColorJSLogger = require('../jslogger.js');

const JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4ifQ' +
  '.dBjftJeZ4CVPmB92K27uhbUJU1p1r_wW1gFWFOEjXk0';

let blobs;
const RealBlob = global.Blob;

beforeEach(() => {
  ColorJSLogger.clearLogs();
  ColorJSLogger.resetRedaction();
  ColorJSLogger.setMaxEntries(2000);
  ColorJSLogger.appName = 'ColorJSLogger';

  // jsdom's Blob keeps its contents private and implements no object-URL API,
  // so stand in a recording Blob. This asserts on the exact bytes handed to
  // the constructor — the payload that actually leaves the user's machine.
  blobs = [];
  global.Blob = function MockBlob(parts, options) {
    this.parts = parts;
    this.text = parts.join('');
    this.type = options && options.type;
    blobs.push(this);
  };

  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = jest.fn();

  jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});

afterEach(() => {
  global.Blob = RealBlob;
  jest.restoreAllMocks();
});

/** Reads back the text actually handed to the Blob constructor. */
const exportedText = () => blobs[blobs.length - 1].text;

describe('downloadLogs() in a browser', () => {
  test('triggers a download with the default filename', () => {
    ColorJSLogger.setAppName('MyApp');
    ColorJSLogger.info('Boot', 'started');
    ColorJSLogger.downloadLogs();

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
    expect(blobs).toHaveLength(1);
    expect(blobs[0].type).toBe('text/plain');
  });

  test('honours an explicit filename', () => {
    const spy = jest.spyOn(document, 'createElement');
    ColorJSLogger.info('Boot', 'started');
    ColorJSLogger.downloadLogs('session.txt');

    const anchor = spy.mock.results[0].value;
    expect(anchor.download).toBe('session.txt');
  });

  test('revokes the object URL to avoid leaking it', () => {
    jest.useFakeTimers();
    ColorJSLogger.info('Boot', 'started');
    ColorJSLogger.downloadLogs();

    jest.runAllTimers();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    jest.useRealTimers();
  });

  test('the exported file never contains a raw secret', () => {
    ColorJSLogger.internal('Auth', `token=${JWT}`);
    ColorJSLogger.internal('Api', { password: 'hunter2', user: 'alice' });
    ColorJSLogger.downloadLogs();

    const text = exportedText();
    expect(text).not.toBeNull();
    expect(text).not.toContain(JWT);
    expect(text).not.toContain('hunter2');
    expect(text).toContain('[REDACTED]');
    expect(text).toContain('alice');
  });

  test('the exported file contains only the retained window', () => {
    ColorJSLogger.setMaxEntries(2);
    ColorJSLogger.internal('Loop', 'oldest-entry');
    ColorJSLogger.internal('Loop', 'middle-entry');
    ColorJSLogger.internal('Loop', 'newest-entry');
    ColorJSLogger.downloadLogs();

    const text = exportedText();
    expect(text).not.toContain('oldest-entry');
    expect(text).toContain('middle-entry');
    expect(text).toContain('newest-entry');
    expect(text.trim().split('\n')).toHaveLength(2);
  });
});
