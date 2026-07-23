/*
 * ColorJSLogger — redaction layer
 *
 * MECHANISM, NOT POLICY. This module provides the means to strip sensitive
 * values out of log entries. Deciding *what* is sensitive — whether to run
 * blacklist or whitelist mode, and which keys go on the list — is the
 * consuming application's policy decision, not this library's.
 *
 * Two independent layers, both applied at capture time (see jslogger.js#_write):
 *
 *   1. redactValue()  — structural, key-based, for logged objects/arrays.
 *                       Recursive, non-mutating, circular-safe.
 *   2. scrubString()  — textual, for the final composed log line. Catches
 *                       secrets that were interpolated into a string before
 *                       the library ever saw them.
 *
 * Neither layer can catch a secret in free-form prose that carries no key and
 * no recognisable shape (e.g. 'the password is hunter2'). No key- or
 * shape-based scheme can. That remains the caller's responsibility.
 *
 * Copyright: (c) 2019-2026 Suhaib Janjua
 * License: MIT
 */

/**
 * The token substituted for every redacted value.
 * @type {string}
 */
export const REDACTED = '[REDACTED]';

/**
 * Placeholder for a value that was already visited on this traversal.
 * @type {string}
 */
export const CIRCULAR = '[Circular]';

/**
 * Built-in deny-list of key patterns, applied case-insensitively as
 * SUBSTRING matches against object keys and string key-shapes.
 *
 * Substring semantics are deliberate: `/token/i` must catch `access_token`,
 * `refreshToken` and `X-Auth-Token`. The cost is occasional over-redaction
 * (`/code/i` also matches `zipcode`, `countryCode`). That trade is intentional
 * — over-redacting a postcode is a cosmetic bug, under-redacting an OAuth
 * `code` is a security one.
 *
 * @type {RegExp[]}
 */
export const DEFAULT_REDACTED_KEY_PATTERNS = [
  /authorization/i,
  /x-rainbow-app-auth/i,
  /x-rainbow-api-key/i,
  /pass(word)?/i,
  /token/i,
  /secret/i,
  /code/i,
];

/**
 * Value-shape rules for scrubString(). These match the SHAPE of a credential
 * rather than a key naming it, so they catch `Authorization: Basic <b64>` and
 * bare tokens pasted into prose.
 *
 * Deliberately narrow: each rule is anchored on an unambiguous marker
 * (`Bearer`, `Basic`, or the `eyJ` prefix that base64-encodes `{"`). There is
 * no generic "long base64/hex blob" heuristic — that would shred UUIDs, git
 * SHAs, content hashes and request IDs. Precision over recall here; the
 * key-shape pass below is the greedy one.
 *
 * The scheme rules are case-SENSITIVE and require an 8+ character value, so
 * prose like 'basic auth is enabled' is left alone. Residual false positive:
 * a capitalised 'Basic Authentication' in prose redacts the second word. That
 * fails safe and is cosmetic, so it is not worth more regex.
 *
 * Order matters: the Bearer/Basic rules must run BEFORE the key-shape pass,
 * or `Authorization: Basic dXNlcjpwdw==` gets its key-shape value clipped at
 * the first space ('Basic') and leaves the base64 payload exposed.
 *
 * @type {Array<{re: RegExp, to: string}>}
 */
const VALUE_SHAPE_RULES = [
  { re: /\b(Bearer)\s+[A-Za-z0-9\-._~+/]{8,}={0,2}/g, to: '$1 ' + REDACTED },
  { re: /\b(Basic)\s+[A-Za-z0-9+/]{8,}={0,2}/g, to: '$1 ' + REDACTED },
  { re: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, to: REDACTED },
];

/**
 * Finds `key=value`, `key: value` and `"key": "value"` shapes.
 *
 * Groups: 1 = optional quote around the key, 2 = the key, 3 = separator with
 * surrounding whitespace, 4/5 = double/single quoted value, 6 = bare value
 * (terminated at whitespace or a delimiter).
 *
 * The log line prefix is safe from this: `Mon Aug 12 2019 22:37:57 | App |
 * [Auth] :: ...` yields key `22` sep `:` value `37`, and `22` matches no deny
 * pattern, so the timestamp survives untouched.
 *
 * The {1,64} bound on the key is load-bearing, NOT cosmetic. Unbounded, this
 * pattern is quadratic: the key class is unanchored, so on a long run of
 * key-legal characters with no separator (a base64 blob, a minified payload)
 * the engine scans to the end and backtracks from every start position. A 40KB
 * run took 3.4s; with the bound it is ~1ms. Keep any key pattern bounded.
 */
const KEY_SHAPE_RE =
  /(["']?)([A-Za-z0-9_.-]{1,64})\1(\s*[=:]\s*)(?:"([^"]*)"|'([^']*)'|([^\s,;&]+))/g;

/**
 * Escapes a literal string for use inside a RegExp.
 * @param {string} str
 * @returns {string}
 */
const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Coerces a user-supplied key into a RegExp. Strings become case-insensitive
 * substring patterns; RegExps pass through untouched.
 * @param {string|RegExp} key
 * @returns {RegExp|null} null if the input is neither a string nor a RegExp
 */
export const toKeyPattern = (key) => {
  if (key instanceof RegExp) return key;
  if (typeof key === 'string' && key.trim()) {
    return new RegExp(escapeRegExp(key.trim()), 'i');
  }
  return null;
};

/**
 * Builds the default redaction config.
 * @returns {{mode: string, keyPatterns: RegExp[], allowedKeys: RegExp[]}}
 */
export const defaultConfig = () => ({
  mode: 'blacklist',
  keyPatterns: DEFAULT_REDACTED_KEY_PATTERNS.slice(),
  allowedKeys: [],
});

/**
 * Is this key sensitive under the current config?
 * @param {string} key
 * @param {object} config
 * @returns {boolean}
 */
const isSensitiveKey = (key, config) =>
  config.keyPatterns.some((re) => re.test(key));

/**
 * Is this key explicitly allowed? Only consulted in whitelist mode.
 * Allow-list entries match the WHOLE key, case-insensitively — an allow-list
 * is a precision instrument and substring matching would silently widen it.
 * @param {string} key
 * @param {object} config
 * @returns {boolean}
 */
const isAllowedKey = (key, config) =>
  config.allowedKeys.some((re) =>
    re instanceof RegExp ? re.test(key) : false
  );

/**
 * Recursively redacts an object or array by key, returning a NEW structure.
 * The caller's original is never read from after cloning and never mutated.
 *
 * - blacklist mode (default): keys matching the deny-list get REDACTED.
 * - whitelist mode: only keys on the allow-list survive; every other value
 *   gets REDACTED regardless of the deny-list.
 *
 * Circular references are replaced with CIRCULAR rather than throwing, which
 * also makes the result safe to hand to JSON.stringify().
 *
 * @param {*} value - Any value; non-objects are returned as-is
 * @param {object} config - As built by defaultConfig()
 * @param {WeakSet} [seen] - Internal; tracks the current ancestor chain
 * @returns {*} A redacted deep clone
 */
export const redactValue = (value, config, seen = new WeakSet()) => {
  if (value === null || typeof value !== 'object') return value;

  // Not a plain container — stringify rather than walk its internals.
  if (value instanceof Date) return value.toISOString();
  if (value instanceof RegExp || value instanceof Error) return String(value);

  if (seen.has(value)) return CIRCULAR;
  seen.add(value);

  let out;
  if (Array.isArray(value)) {
    // Array indices are positions, not names — key rules never apply to them.
    out = value.map((item) => redactValue(item, config, seen));
  } else {
    out = {};
    for (const key of Object.keys(value)) {
      if (config.mode === 'whitelist') {
        out[key] = isAllowedKey(key, config)
          ? redactValue(value[key], config, seen)
          : REDACTED;
      } else if (isSensitiveKey(key, config)) {
        out[key] = REDACTED;
      } else {
        out[key] = redactValue(value[key], config, seen);
      }
    }
  }

  // Sibling branches may legitimately share a reference; only an ANCESTOR
  // repeat is a cycle. Releasing here keeps DAGs from being mislabelled.
  seen.delete(value);
  return out;
};

/**
 * Scrubs credentials out of an already-composed log line.
 *
 * Value-shape rules run first (see VALUE_SHAPE_RULES), then the key-shape
 * pass. Runs in both blacklist and whitelist mode: a bare string carries no
 * structure for an allow-list to filter, so the deny-list is the only usable
 * defence for it either way.
 *
 * @param {string} line
 * @param {object} config
 * @returns {string}
 */
export const scrubString = (line, config) => {
  if (typeof line !== 'string' || !line) return line;

  let out = line;
  for (const rule of VALUE_SHAPE_RULES) {
    out = out.replace(rule.re, rule.to);
  }

  out = out.replace(KEY_SHAPE_RE, (match, quote, key, sep, dq, sq, bare) => {
    if (!isSensitiveKey(key, config)) return match;
    if (dq !== undefined) return `${quote}${key}${quote}${sep}"${REDACTED}"`;
    if (sq !== undefined) return `${quote}${key}${quote}${sep}'${REDACTED}'`;
    // `bare` is unused beyond confirming which alternative matched.
    void bare;
    return `${quote}${key}${quote}${sep}${REDACTED}`;
  });

  // Both layers legitimately fire on the same span: the value-shape pass turns
  // 'Authorization: Basic <b64>' into 'Authorization: Basic [REDACTED]', and
  // the key-shape pass then redacts the now-bare 'Basic', yielding
  // '[REDACTED] [REDACTED]'. Safe, but noise. Collapse adjacent markers only —
  // markers separated by real text stay distinct.
  return out.replace(/\[REDACTED\](?:\s+\[REDACTED\])+/g, REDACTED);
};
