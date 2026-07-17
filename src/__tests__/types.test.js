/**
 * ColorJSLogger — type-definition drift guard
 *
 * src/index.d.ts is hand-written (there is no .ts source to generate it from),
 * so nothing but this test stops it drifting from the runtime object. The
 * `types` field pointed at a file that was never emitted for 22 releases;
 * this is the cheap check that keeps the replacement honest.
 */

const fs = require('fs');
const path = require('path');
const ColorJSLogger = require('../jslogger.js');

const dts = fs.readFileSync(path.join(__dirname, '..', 'index.d.ts'), 'utf8');

/** Members declared on the interface, ignoring comments. */
const declaredMembers = () => {
  const body = dts.slice(
    dts.indexOf('export interface ColorJSLoggerStatic {'),
    dts.indexOf('declare const ColorJSLogger:')
  );
  const withoutComments = body.replace(/\/\*\*[\s\S]*?\*\//g, '');
  const names = new Set();
  const re = /^\s{2}([A-Za-z_][A-Za-z0-9_]*)\??[(:]/gm;
  let m;
  while ((m = re.exec(withoutComments)) !== null) names.add(m[1]);
  return names;
};

/** Public runtime members — anything not prefixed with `_`. */
const runtimeMembers = () => {
  const names = new Set();
  for (const key of Object.keys(ColorJSLogger)) {
    if (!key.startsWith('_')) names.add(key);
  }
  // Accessors live on the prototype-less literal as descriptors.
  for (const key of Object.getOwnPropertyNames(ColorJSLogger)) {
    if (!key.startsWith('_')) names.add(key);
  }
  return names;
};

describe('index.d.ts matches the runtime API', () => {
  test('every public runtime member is declared', () => {
    const declared = declaredMembers();
    const missing = [...runtimeMembers()].filter(
      (name) => !declared.has(name) && name !== 'useIE11'
    );

    expect(missing).toEqual([]);
  });

  test('every declared member exists at runtime', () => {
    const runtime = runtimeMembers();
    // useIE11 is only defined when IE11 is sniffed, so it is optional in the
    // .d.ts and legitimately absent here.
    const phantom = [...declaredMembers()].filter(
      (name) => !runtime.has(name) && name !== 'useIE11'
    );

    expect(phantom).toEqual([]);
  });

  test('the guard can actually see members (self-check)', () => {
    // If the regex silently matched nothing, both tests above would pass
    // vacuously. Anchor on members that must always exist.
    expect(declaredMembers()).toContain('setMaxEntries');
    expect(declaredMembers()).toContain('addRedactedKeys');
    expect(declaredMembers().size).toBeGreaterThan(15);
  });
});
