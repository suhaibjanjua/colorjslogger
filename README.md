<h1 align="center">ColorJSLogger</h1>
<p align="center">Colorful, downloadable browser console logs — with secrets redacted before they are ever stored.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/colorjslogger"><img alt="npm" src="https://img.shields.io/npm/v/colorjslogger"></a>
  <a href="https://github.com/suhaibjanjua/colorjslogger/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/suhaibjanjua/colorjslogger/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://github.com/suhaibjanjua/colorjslogger/blob/master/LICENSE.md"><img alt="License" src="https://img.shields.io/npm/l/colorjslogger"></a>
  <a href="https://bundlephobia.com/package/colorjslogger"><img alt="Size" src="https://img.shields.io/bundlephobia/minzip/colorjslogger"></a>
</p>

---

ColorJSLogger prints color-coded, timestamped, app-prefixed logs to the browser
console and keeps them in memory so a user can hand you the whole session as a
`.log` file. Zero dependencies.

It is built for applications that log around sensitive data. Every entry is
redacted **at capture** — before it enters the buffer — so the in-memory history
and the downloaded file never contain a raw token, password, or auth header.

```js
jslogger.internal('Auth', `token=${accessToken}`);
// buffered and downloaded as:
// Fri Jul 17 2026 09:14:22 | MyApp | [Auth] :: token=[REDACTED]
```

## Contents

- [Install](#install)
- [Quick start](#quick-start)
- [API](#api)
- [Redaction](#redaction)
- [Log retention](#log-retention)
- [Security](#security)
- [Demo](#demo)
- [Contributing](#contributing)
- [License](#license)

## Install

```bash
npm install colorjslogger
```

### Bundlers (Vite, React, webpack, Rollup)

The package has a **default export**. There is no named export of the logger.

```js
import jslogger from 'colorjslogger';

jslogger.setAppName('MyApp');
jslogger.info('Boot', 'Application started');
```

TypeScript definitions ship with the package and are picked up automatically —
no `@types` install.

```ts
import jslogger, { type RedactionMode } from 'colorjslogger';
```

### Script tag (CDN)

The UMD build exposes the global **`ColorJSLogger`** (with `jslogger` as a
legacy alias):

```html
<script src="https://cdn.jsdelivr.net/npm/colorjslogger@5.0.0/dist/jslogger.min.js"></script>
<script>
  ColorJSLogger.setAppName('MyApp');
  ColorJSLogger.info('Boot', 'Application started');
</script>
```

### ES modules in the browser, no bundler

```html
<script type="module">
  import jslogger from 'https://cdn.jsdelivr.net/npm/colorjslogger@5.0.0/dist/jslogger.esm.js';

  jslogger.info('Boot', 'Imported as an ES module');
</script>
```

Pin the version rather than using `@latest`, so a future major cannot change
behaviour under a cached page.

### Entry points

| Field | File | Format |
| --- | --- | --- |
| `main` / `require` | `dist/jslogger.js` | UMD (global `ColorJSLogger`) |
| `module` / `import` | `dist/jslogger.esm.js` | ES module |
| `types` | `dist/index.d.ts` | TypeScript |
| — | `dist/jslogger.min.js` | UMD, minified, for script tags |

## Quick start

```js
import jslogger from 'colorjslogger';

jslogger.setAppName('AdminCenter');

jslogger.info('Auth', 'Connection in progress');
jslogger.success('Auth', 'User logged in');
jslogger.warning('Api', 'Retrying request');
jslogger.error('Api', 'Request failed');

jslogger.setLevelToVerbose(true);
jslogger.debug('Auth', 'Token refresh initiated');

jslogger.downloadLogs('session.log');
```

Every log method takes exactly two arguments: a `process` label and a message.

```
Fri Jul 17 2026 09:14:22 | AdminCenter | [Auth] :: Connection in progress
└─ timestamp ──────────┘   └─ appName ┘   └ process ┘   └─ message ─┘
```

## API

### Logging

| Method | Console | Buffer |
| --- | --- | --- |
| `info(process, message)` | black | ✅ |
| `success(process, message)` | green | ✅ |
| `warning(process, message)` | orange | ✅ |
| `error(process, message)` | red | ✅ |
| `debug(process, message)` | blue, **only if verbose** | ✅ always |
| `internal(process, message)` | never printed | ✅ |
| `log(process, message)` | alias for `info` | ✅ |

`message` may be a string or an object. Objects are key-redacted, then
serialised:

```js
jslogger.info('Api', { user: 'alice', password: 'hunter2' });
// [Api] :: {"user":"alice","password":"[REDACTED]"}
```

`internal()` keeps an entry out of the console but still records it for the
downloaded file. It is a noise-control tool, **not** a security boundary — see
[Security](#security).

### Configuration

| Method | Description |
| --- | --- |
| `setAppName(name)` | Prefix for every log line. Non-string or empty input is rejected with a warning. |
| `setLevelToVerbose(bool)` | Whether `debug()` reaches the console. Default `false`. |
| `setMaxEntries(n)` | Retained entry cap. Default `2000`. |
| `getMaxEntries()` | Current cap. |
| `addRedactedKeys(keys)` | Extend the redaction deny-list. |
| `setRedactionMode(mode)` | `'blacklist'` (default) or `'whitelist'`. |
| `setAllowedKeys(keys)` | Allow-list used by whitelist mode. |
| `resetRedaction()` | Restore the built-in defaults. |

### Log access

| Method | Description |
| --- | --- |
| `getLogs()` | Retained entries, oldest first, newline-joined. |
| `getEntryCount()` | Number of retained entries. |
| `clearLogs()` | Empty the buffer. |
| `downloadLogs(filename?)` | Download the retained window as a text file. Warns and no-ops outside a browser. |
| `version()` | Library version. |
| `about()` | Project URL and copyright. |

## Redaction

Redaction runs **at capture**, inside the single code path every log method
shares, before the entry is written to the buffer. The buffer, the console and
`downloadLogs()` all observe the same already-redacted string. There is no code
path that retains a raw value after a log call returns.

Two layers run on every entry.

**1. Key-based redaction of object payloads.** Recursive through nested objects
and arrays, case-insensitive, matched as substrings so `token` also catches
`access_token` and `refreshToken`. Your original object is never mutated, and
circular references are handled rather than thrown.

Redacted by default: `authorization`, `x-rainbow-app-auth`, `x-rainbow-api-key`,
`password` / `pass`, `token`, `secret`, and `code` (OAuth).

```js
jslogger.internal('Api', {
  method: 'POST',
  headers: { Authorization: 'Basic ' + btoa('user:hunter2') },
  body: { grant_type: 'password', code: '4/0AY0e-g7' },
});
// [Api] :: {"method":"POST","headers":{"Authorization":"[REDACTED]"},
//           "body":{"grant_type":"password","code":"[REDACTED]"}}
```

Note `grant_type` in that output. Matching is on **key names, not values** — the
key `grant_type` is not sensitive, so its literal value `"password"` is kept.
`code` and `Authorization` are redacted because their *keys* match.

**2. A scan of the composed line.** Catches secrets that were interpolated into
a string before the library ever saw them:

- key shapes — `token=…`, `password: …`, `"secret": "…"` for any deny-listed key
- value shapes — `Bearer <token>`, `Basic <base64>`, and bare JWTs

```js
jslogger.internal('Auth', `Authorization: Basic ${btoa('user:hunter2')}`);
// [Auth] :: Authorization: [REDACTED]

jslogger.internal('Auth', `returning ${jwt} to caller`);
// [Auth] :: returning [REDACTED] to caller
```

The value-shape rules are deliberately narrow, anchored on unambiguous markers.
There is no generic "long base64 blob" heuristic, so UUIDs, git SHAs, content
hashes and request IDs survive intact:

```js
jslogger.info('Req', 'requestId=550e8400-e29b-41d4-a716-446655440000');
// [Req] :: requestId=550e8400-e29b-41d4-a716-446655440000
```

### Extending the deny-list

Strings match case-insensitively as substrings; pass a `RegExp` for exact
control.

```js
jslogger.addRedactedKeys(['ssn', 'account_number', /^pin$/i]);
```

### Whitelist mode

Blacklist mode is the default because it is safe with no configuration. If your
threat model calls for it, invert the default so that **only** approved keys
survive and everything else is redacted — including fields you did not
anticipate.

```js
jslogger.setAllowedKeys(['userId', 'method', 'status', 'durationMs']);
jslogger.setRedactionMode('whitelist');

jslogger.internal('Api', { userId: 42, status: 200, sessionKey: 'abc' });
// [Api] :: {"userId":42,"status":200,"sessionKey":"[REDACTED]"}
```

Allow-list entries match the **whole** key, case-insensitively. Call
`setAllowedKeys()` before switching modes, or every field will come out
redacted.

This library provides the mechanism. Choosing whitelist mode and deciding what
belongs on the allow-list is a policy decision that belongs to your application.

## Log retention

The buffer is a bounded ring: **2000 entries by default**, evicting oldest
first. `downloadLogs()` exports exactly the retained window.

```js
jslogger.setMaxEntries(500);
```

Values that are non-numeric, non-finite, or `<= 0` are rejected with a console
warning and leave the current cap unchanged. Lowering the cap evicts down to it
immediately.

## Security

**Redact-at-capture guarantee.** Every log method funnels through one choke
point that composes the entry, redacts it, and only then writes it to the
buffer. Redaction is never a display-time filter. The buffer never holds a raw
sensitive value, so the downloaded `.log` file cannot leak one that redaction
matched.

**What redaction cannot do.** Both layers are key- and shape-based, and no such
scheme can catch a secret in free-form prose that carries neither:

```js
jslogger.info('Auth', 'the password is hunter2');
// [Auth] :: the password is hunter2   ← NOT redacted
```

There is no key here to match and no recognisable credential shape. Redaction is
a safety net for the realistic accidents — a stringified request body, an
interpolated header, a logged options object — not a guarantee that anything you
pass will be sanitised. **What you choose to log remains your responsibility.**

Known limits, stated plainly:

- Prose containing a bare secret is not caught (above).
- Opaque credentials with no key and no distinctive shape — a raw session ID, an
  API key that looks like any other random string — are not caught. Add their key
  names via `addRedactedKeys()`, or use whitelist mode.
- Substring key matching over-redacts by design: `code` also matches `zipcode`.
  Over-redacting is the safe direction.
- Redaction applies to what you pass in. It cannot reach a secret already
  concatenated into a string in a shape it does not recognise.

**No client-side logger is a secure store.** The buffer is plain JavaScript
memory in the user's browser: readable from the console, from any script on the
page, and from any extension with page access. The downloaded file is plaintext
on the user's disk. Redaction here reduces the blast radius of logs you ship
around — attached to a support ticket, pasted into a chat — it does not make the
browser a safe place to keep secrets. Treat anything reaching the client as
already disclosed to the user, and keep real secrets server-side.

To report a vulnerability, see [SECURITY.md](SECURITY.md).

## Demo

**[Live demo](https://suhaibjanjua.github.io/colorjslogger/examples/demo.html)** —
open your browser console to see the colored output.

```bash
npm run demo   # node examples/node-demo.js
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

```bash
npm install
npm test        # lint + typecheck + jest
npm run build   # UMD + ESM + types into dist/
```

## License

MIT — see [LICENSE.md](LICENSE.md). Copyright (c) 2019-2025 Suhaib Janjua.
</content>
