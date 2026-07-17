/**
 * ColorJSLogger — redaction and ring buffer tests
 *
 * The governing invariant under test: a raw sensitive value must never enter
 * the buffer. Every assertion here inspects the buffer directly rather than
 * trusting a display-time filter.
 */

const ColorJSLogger = require('../jslogger.js');

const JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4ifQ' +
  '.dBjftJeZ4CVPmB92K27uhbUJU1p1r_wW1gFWFOEjXk0';

// btoa('svc-user:hunter2')
const BASIC_B64 = 'c3ZjLXVzZXI6aHVudGVyMg==';

const originalConsole = global.console;

/** The raw buffer array, reached without going through any accessor. */
const rawEntries = () => ColorJSLogger._entries;

beforeEach(() => {
  ColorJSLogger.clearLogs();
  ColorJSLogger.resetRedaction();
  ColorJSLogger.setMaxEntries(2000);
  ColorJSLogger.appName = 'ColorJSLogger';
  ColorJSLogger.VERBOSE = false;

  global.console = { ...originalConsole, log: jest.fn(), warn: jest.fn() };
});

afterEach(() => {
  global.console = originalConsole;
});

describe('Redaction at capture (2.1)', () => {
  test('buffer never holds the raw value from internal()', () => {
    ColorJSLogger.internal('Auth', `token=${JWT}`);

    expect(rawEntries()).toHaveLength(1);
    expect(rawEntries()[0]).not.toContain(JWT);
    expect(rawEntries()[0]).toContain('[REDACTED]');
    expect(ColorJSLogger.getLogs()).not.toContain(JWT);
  });

  test('console output shows the redacted form, not the raw value', () => {
    ColorJSLogger.info('Auth', `token=${JWT}`);

    expect(console.log).toHaveBeenCalled();
    const printed = console.log.mock.calls[0].join(' ');
    expect(printed).not.toContain(JWT);
    expect(printed).toContain('[REDACTED]');
  });

  test('debug() redacts even when VERBOSE is off and it skips the console', () => {
    ColorJSLogger.setLevelToVerbose(false);
    ColorJSLogger.debug('Auth', `password=hunter2`);

    expect(console.log).not.toHaveBeenCalled();
    expect(rawEntries()[0]).not.toContain('hunter2');
    expect(rawEntries()[0]).toContain('[REDACTED]');
  });

  test('the raw value is not retained anywhere after the call returns', () => {
    ColorJSLogger.internal('Auth', `secret=${JWT}`);

    const everything = JSON.stringify(ColorJSLogger);
    expect(everything).not.toContain(JWT);
  });
});

describe('String scan — key shapes', () => {
  test('token=<jwt>', () => {
    ColorJSLogger.internal('Auth', `token=${JWT}`);
    expect(rawEntries()[0]).not.toContain(JWT);
  });

  test('key: value', () => {
    ColorJSLogger.internal('Auth', 'password: hunter2');
    expect(rawEntries()[0]).not.toContain('hunter2');
    expect(rawEntries()[0]).toContain('password: [REDACTED]');
  });

  test('stringified JSON containing a deny-listed key', () => {
    const body = JSON.stringify({ user: 'alice', password: 'hunter2' });
    ColorJSLogger.internal('Api', body);

    expect(rawEntries()[0]).not.toContain('hunter2');
    expect(rawEntries()[0]).toContain('"password":"[REDACTED]"');
    // Non-sensitive siblings survive.
    expect(rawEntries()[0]).toContain('alice');
  });

  test('rainbow headers are covered', () => {
    ColorJSLogger.internal(
      'Api',
      'x-rainbow-app-auth=abc123 x-rainbow-api-key=def456'
    );

    expect(rawEntries()[0]).not.toContain('abc123');
    expect(rawEntries()[0]).not.toContain('def456');
  });

  test('OAuth code is covered', () => {
    ColorJSLogger.internal('OAuth', 'code=4/0AY0e-g7xQ');
    expect(rawEntries()[0]).not.toContain('4/0AY0e-g7xQ');
  });
});

describe('String scan — value shapes', () => {
  test('Authorization: Basic <b64> never reaches the buffer', () => {
    ColorJSLogger.internal('Auth', `Authorization: Basic ${BASIC_B64}`);

    expect(rawEntries()[0]).not.toContain(BASIC_B64);
    expect(rawEntries()[0]).toContain('[REDACTED]');
  });

  test('Bearer <token>', () => {
    ColorJSLogger.internal('Auth', `Authorization: Bearer ${JWT}`);
    expect(rawEntries()[0]).not.toContain(JWT);
  });

  test('overlapping layers collapse to a single marker', () => {
    // Value-shape redacts 'Basic <b64>', then key-shape redacts the bare
    // 'Basic' left behind. Both firing is correct; two markers is just noise.
    ColorJSLogger.internal('Auth', `Authorization: Basic ${BASIC_B64}`);
    expect(rawEntries()[0]).toContain('Authorization: [REDACTED]');
    expect(rawEntries()[0]).not.toContain('[REDACTED] [REDACTED]');
  });

  test('markers separated by real text stay distinct', () => {
    ColorJSLogger.internal('Auth', 'token=abc123xyz user=alice secret=shh');

    const entry = rawEntries()[0];
    expect(entry).toContain('user=alice');
    expect(entry.match(/\[REDACTED\]/g)).toHaveLength(2);
  });

  test('a bare JWT with no key name', () => {
    ColorJSLogger.internal('Auth', `handing back ${JWT} to the caller`);

    expect(rawEntries()[0]).not.toContain(JWT);
    expect(rawEntries()[0]).toContain('[REDACTED]');
    expect(rawEntries()[0]).toContain('handing back');
  });
});

describe('String scan — negative cases (must NOT redact)', () => {
  test('a UUID survives', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    ColorJSLogger.internal('Req', `requestId=${uuid}`);

    expect(rawEntries()[0]).toContain(uuid);
    expect(rawEntries()[0]).not.toContain('[REDACTED]');
  });

  test('a git SHA survives', () => {
    const sha = 'e83c5163316f89bfbde7d9ab23ca2e25604af290';
    ColorJSLogger.internal('Build', `commit=${sha}`);

    expect(rawEntries()[0]).toContain(sha);
  });

  test('the timestamp prefix is never mangled', () => {
    ColorJSLogger.internal('Auth', 'nothing sensitive here');
    expect(rawEntries()[0]).toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  test('lowercase prose about basic auth survives', () => {
    ColorJSLogger.internal('Auth', 'falling back to basic auth for this call');
    expect(rawEntries()[0]).toContain('basic auth for this call');
  });
});

describe('Object payload redaction (2.3)', () => {
  test('redacts deny-listed keys and keeps the rest', () => {
    ColorJSLogger.internal('Api', { user: 'alice', password: 'hunter2' });

    expect(rawEntries()[0]).not.toContain('hunter2');
    expect(rawEntries()[0]).toContain('alice');
    expect(rawEntries()[0]).toContain('[REDACTED]');
  });

  test('matches keys case-insensitively and as substrings', () => {
    ColorJSLogger.internal('Api', {
      Authorization: 'Basic ' + BASIC_B64,
      access_token: JWT,
      refreshToken: 'rt-abc',
      clientSecret: 'cs-xyz',
    });

    const entry = rawEntries()[0];
    expect(entry).not.toContain(BASIC_B64);
    expect(entry).not.toContain(JWT);
    expect(entry).not.toContain('rt-abc');
    expect(entry).not.toContain('cs-xyz');
  });

  test('recurses into nested objects and arrays', () => {
    ColorJSLogger.internal('Api', {
      request: {
        headers: [{ authorization: 'Basic ' + BASIC_B64 }],
        body: { nested: { deep: { password: 'hunter2' } } },
      },
    });

    const entry = rawEntries()[0];
    expect(entry).not.toContain(BASIC_B64);
    expect(entry).not.toContain('hunter2');
  });

  test('does not mutate the caller original', () => {
    const payload = {
      user: 'alice',
      password: 'hunter2',
      nested: { token: 't' },
    };
    const before = JSON.parse(JSON.stringify(payload));

    ColorJSLogger.internal('Api', payload);

    expect(payload).toEqual(before);
    expect(payload.password).toBe('hunter2');
    expect(payload.nested.token).toBe('t');
  });

  test('survives circular references without throwing', () => {
    const payload = { name: 'root', password: 'hunter2' };
    payload.self = payload;

    expect(() => ColorJSLogger.internal('Api', payload)).not.toThrow();
    expect(rawEntries()[0]).not.toContain('hunter2');
    expect(rawEntries()[0]).toContain('[Circular]');
  });

  test('a shared (non-circular) reference is not mislabelled as circular', () => {
    const shared = { id: 1 };
    ColorJSLogger.internal('Api', { a: shared, b: shared });

    expect(rawEntries()[0]).not.toContain('[Circular]');
  });

  test('the two-string signature is unchanged', () => {
    ColorJSLogger.info('Auth', 'plain message');
    expect(rawEntries()[0]).toContain('[Auth] :: plain message');
  });
});

describe('Redaction configuration (2.3)', () => {
  test('addRedactedKeys extends the deny-list', () => {
    ColorJSLogger.addRedactedKeys(['ssn']);
    ColorJSLogger.internal('Api', { ssn: '123-45-6789', user_ssn: '999' });

    expect(rawEntries()[0]).not.toContain('123-45-6789');
    expect(rawEntries()[0]).not.toContain('999');
  });

  test('addRedactedKeys accepts a RegExp', () => {
    ColorJSLogger.addRedactedKeys([/^pin$/i]);
    ColorJSLogger.internal('Api', { pin: '4242', pineapple: 'fruit' });

    expect(rawEntries()[0]).not.toContain('4242');
    expect(rawEntries()[0]).toContain('fruit');
  });

  test('addRedactedKeys rejects a non-array', () => {
    ColorJSLogger.addRedactedKeys('ssn');
    expect(console.warn).toHaveBeenCalled();
  });

  test('whitelist mode redacts everything not allowed', () => {
    ColorJSLogger.setRedactionMode('whitelist');
    ColorJSLogger.setAllowedKeys(['user', 'level']);
    ColorJSLogger.internal('Api', {
      user: 'alice',
      level: 'admin',
      password: 'hunter2',
      surprise: 'unexpected-field',
    });

    const entry = rawEntries()[0];
    expect(entry).toContain('alice');
    expect(entry).toContain('admin');
    expect(entry).not.toContain('hunter2');
    expect(entry).not.toContain('unexpected-field');
  });

  test('whitelist allow-list matches whole keys only', () => {
    ColorJSLogger.setRedactionMode('whitelist');
    ColorJSLogger.setAllowedKeys(['user']);
    ColorJSLogger.internal('Api', { user: 'alice', username_secret: 'nope' });

    expect(rawEntries()[0]).toContain('alice');
    expect(rawEntries()[0]).not.toContain('nope');
  });

  test('whitelist mode recurses into allowed subtrees', () => {
    ColorJSLogger.setRedactionMode('whitelist');
    ColorJSLogger.setAllowedKeys(['request', 'method']);
    ColorJSLogger.internal('Api', {
      request: { method: 'POST', authorization: 'Basic ' + BASIC_B64 },
    });

    expect(rawEntries()[0]).toContain('POST');
    expect(rawEntries()[0]).not.toContain(BASIC_B64);
  });

  test('the string scan still runs in whitelist mode', () => {
    ColorJSLogger.setRedactionMode('whitelist');
    ColorJSLogger.setAllowedKeys(['user']);
    ColorJSLogger.internal('Auth', `token=${JWT}`);

    expect(rawEntries()[0]).not.toContain(JWT);
  });

  test('setRedactionMode rejects an unknown mode', () => {
    ColorJSLogger.setRedactionMode('whatever');
    expect(console.warn).toHaveBeenCalled();
    expect(ColorJSLogger._redaction.mode).toBe('blacklist');
  });

  test('resetRedaction restores the defaults', () => {
    ColorJSLogger.setRedactionMode('whitelist');
    ColorJSLogger.addRedactedKeys(['ssn']);
    ColorJSLogger.resetRedaction();

    expect(ColorJSLogger._redaction.mode).toBe('blacklist');
    ColorJSLogger.internal('Api', { ssn: '123-45-6789' });
    expect(rawEntries()[0]).toContain('123-45-6789');
  });
});

describe('Bounded ring buffer (2.2)', () => {
  test('defaults to 2000 entries on a freshly loaded module', () => {
    // beforeEach sets the cap explicitly, so re-require to see the real default.
    let fresh;
    jest.isolateModules(() => {
      fresh = require('../jslogger.js');
    });
    expect(fresh.getMaxEntries()).toBe(2000);
  });

  test('drops the oldest first once full', () => {
    ColorJSLogger.setMaxEntries(3);
    for (let i = 1; i <= 5; i++) ColorJSLogger.internal('Loop', `entry-${i}`);

    expect(ColorJSLogger.getEntryCount()).toBe(3);
    const logs = ColorJSLogger.getLogs();
    expect(logs).not.toContain('entry-1');
    expect(logs).not.toContain('entry-2');
    expect(logs).toContain('entry-3');
    expect(logs).toContain('entry-5');
  });

  test('holds at the cap under sustained load', () => {
    ColorJSLogger.setMaxEntries(2000);
    for (let i = 0; i < 2500; i++) ColorJSLogger.internal('Loop', `e-${i}`);

    // Retained window is e-500 .. e-2499. Anchor on ':: ' + '\n' so that
    // 'e-499' cannot accidentally match inside 'e-1499'.
    expect(ColorJSLogger.getEntryCount()).toBe(2000);
    expect(ColorJSLogger.getLogs()).not.toContain(':: e-499\n');
    expect(ColorJSLogger.getLogs()).toContain(':: e-500\n');
    expect(ColorJSLogger.getLogs()).toContain(':: e-2499\n');
  });

  test('downloadLogs exports exactly the retained window', () => {
    ColorJSLogger.setMaxEntries(2);
    ColorJSLogger.internal('Loop', 'old');
    ColorJSLogger.internal('Loop', 'mid');
    ColorJSLogger.internal('Loop', 'new');

    // getLogs() is what downloadLogs() blobs; see jslogger.js#downloadLogs.
    const exported = ColorJSLogger.getLogs();
    expect(exported).not.toContain('old');
    expect(exported).toContain('mid');
    expect(exported).toContain('new');
    expect(exported.trim().split('\n')).toHaveLength(2);
  });

  test('lowering the cap evicts down to it immediately', () => {
    ColorJSLogger.setMaxEntries(10);
    for (let i = 1; i <= 10; i++) ColorJSLogger.internal('Loop', `entry-${i}`);

    ColorJSLogger.setMaxEntries(2);
    expect(ColorJSLogger.getEntryCount()).toBe(2);
    expect(ColorJSLogger.getLogs()).toContain(':: entry-9\n');
    expect(ColorJSLogger.getLogs()).toContain(':: entry-10\n');
    // ':: entry-1\n' anchors the line end so it cannot match 'entry-10'.
    expect(ColorJSLogger.getLogs()).not.toContain(':: entry-1\n');
  });

  test.each([[0], [-5], ['100'], [null], [NaN], [Infinity], [undefined]])(
    'rejects a nonsense cap: %p',
    (bad) => {
      ColorJSLogger.setMaxEntries(50);
      ColorJSLogger.setMaxEntries(bad);

      expect(console.warn).toHaveBeenCalled();
      expect(ColorJSLogger.getMaxEntries()).toBe(50);
    }
  );

  test('floors a fractional cap', () => {
    ColorJSLogger.setMaxEntries(2.9);
    expect(ColorJSLogger.getMaxEntries()).toBe(2);
  });
});

describe('objLogs legacy accessor', () => {
  test('reads back the retained window', () => {
    ColorJSLogger.internal('Loop', 'one');
    expect(ColorJSLogger.objLogs).toBe(ColorJSLogger.getLogs());
    expect(ColorJSLogger.objLogs).toContain('one');
  });

  test("the historical objLogs = '' idiom still clears", () => {
    ColorJSLogger.internal('Loop', 'one');
    ColorJSLogger.objLogs = '';

    expect(ColorJSLogger.getEntryCount()).toBe(0);
    expect(ColorJSLogger.objLogs).toBe('');
  });

  test('warns rather than throwing on a non-empty write', () => {
    expect(() => {
      ColorJSLogger.objLogs = 'seeded';
    }).not.toThrow();
    expect(console.warn).toHaveBeenCalled();
    expect(ColorJSLogger.getLogs()).toBe('');
  });
});
