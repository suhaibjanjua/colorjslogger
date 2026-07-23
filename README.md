<div align="center">

# 🎨 ColorJSLogger

**Colorful, structured browser logs that live in memory — and download as a file.**

No servers. No network calls. No telemetry. Nothing ever leaves the browser.

[![npm version](https://img.shields.io/npm/v/colorjslogger?color=%23c1272d&label=npm)](https://www.npmjs.com/package/colorjslogger)
[![CI](https://github.com/suhaibjanjua/colorjslogger/actions/workflows/ci.yml/badge.svg)](https://github.com/suhaibjanjua/colorjslogger/actions/workflows/ci.yml)
[![minzipped](https://img.shields.io/bundlephobia/minzip/colorjslogger?color=%23007ec6)](https://bundlephobia.com/package/colorjslogger)
[![dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](https://www.npmjs.com/package/colorjslogger?activeTab=dependencies)
[![types](https://img.shields.io/npm/types/colorjslogger)](https://www.npmjs.com/package/colorjslogger)
[![license](https://img.shields.io/npm/l/colorjslogger?color=yellow)](LICENSE.md)

[Install](#-install) · [Quick start](#-quick-start) · [API reference](#-api-reference) · [Client-side by design](#-client-side-by-design) · [Redaction](#-redaction) · [Security](#-security)

</div>

---

```js
let username = 'Suhaib Janjua';
jslogger.log('AuthService', `Authentication successful: User "${username}" loggedin.`);
```

```text
Mon Aug 12 2019 22:37:57 | JSLogger | [AuthService] :: Authentication successful: User "Suhaib Janjua" loggedin.
```

Five color-coded levels, a configurable app name on every line, a bounded in-memory
history, and a one-call download of the whole session as a `.log` file. Zero
dependencies, ~2 KB gzipped.

---

## 🔒 Client-side by design

This is the part that matters most: **ColorJSLogger has no backend, and never will.**

Every entry your app logs is composed in the browser, redacted in the browser, and
appended to a plain JavaScript array held in page memory. That array is the entire
storage layer. When you call `downloadLogs()`, the library stitches those entries into
a string, wraps it in a `Blob`, and triggers a normal browser download.

```
   jslogger.info(…)                                    downloadLogs()
          │                                                   │
          ▼                                                   ▼
   ┌──────────────┐    redact at    ┌──────────────────┐   ┌────────────┐
   │ compose line │ ─── capture ──▶ │  _entries[]      │──▶│ Blob → <a> │──▶ 💾 user's disk
   └──────────────┘                 │  (page memory,   │   └────────────┘
          │                         │   max 2000)      │
          ▼                         └──────────────────┘
   🖥️  console.log
```

| | |
| --- | --- |
| 🚫 **No network** | The source contains no `fetch`, no `XMLHttpRequest`, no `WebSocket`, no `sendBeacon`, no image beacons. Nothing is transmitted anywhere. |
| 🚫 **No persistence** | Nothing is written to `localStorage`, `sessionStorage`, `IndexedDB`, or cookies. Close the tab and the buffer is gone. |
| 🚫 **No telemetry** | No analytics, no phone-home, no version check. |
| ✅ **Memory only** | A bounded `string[]` in page memory — capped at 2000 entries, oldest evicted first, so a long-lived SPA cannot leak memory through it. |
| ✅ **User-initiated download** | The file is produced locally via `Blob` + `URL.createObjectURL()`. The user chooses to save it; it never touches a server. |
| ✅ **Zero dependencies** | Nothing in your bundle but this library — no transitive supply chain. |

> **Note:** because the buffer is ordinary page memory, it is readable by devtools and
> by any script running on the page, and the downloaded file is plaintext on disk. That
> is a deliberate trade — see [Security](#-security).

---

## 📦 Install

```bash
npm install colorjslogger
```

<details open>
<summary><b>Bundlers — Vite, React, Next.js, webpack, Rollup</b></summary>

The package has a **default export**. There is no named export of the logger.

```js
import jslogger from 'colorjslogger';

jslogger.setAppName('JSLogger');
jslogger.info('Boot', 'Application started');
```

TypeScript definitions ship with the package and are picked up automatically — no
`@types` install needed.

</details>

<details>
<summary><b>Script tag — CDN</b></summary>

The UMD build exposes the global **`ColorJSLogger`** (with `jslogger` as a legacy alias):

```html
<script src="https://cdn.jsdelivr.net/npm/colorjslogger@5.0.0/dist/jslogger.min.js"></script>
<script>
  ColorJSLogger.setAppName('JSLogger');
  ColorJSLogger.info('Boot', 'Application started');
</script>
```

</details>

<details>
<summary><b>ES modules in the browser — no bundler</b></summary>

```html
<script type="module">
  import jslogger from 'https://cdn.jsdelivr.net/npm/colorjslogger@5.0.0/dist/jslogger.esm.js';

  jslogger.info('Boot', 'Imported as an ES module');
</script>
```

</details>

Pin the version rather than using `@latest`, so a future major cannot change behaviour
under a cached page.

**Entry points**

| Field | File | Format |
| --- | --- | --- |
| `main` / `require` | `dist/jslogger.js` | UMD (global `ColorJSLogger`) |
| `module` / `import` | `dist/jslogger.esm.js` | ES module |
| `types` | `dist/index.d.ts` | TypeScript |
| — | `dist/jslogger.min.js` | UMD, minified, for script tags |

---

## 🚀 Quick start

```js
import jslogger from 'colorjslogger';

jslogger.setAppName('JSLogger');

let username = 'Suhaib Janjua';
jslogger.info('AuthService', `Authentication successful: User "${username}" loggedin.`);
jslogger.success('AuthService', `Profile for "${username}" synced successfully.`);
jslogger.warning('TokenService', 'Access token expires in 60 seconds.');
jslogger.error('ApiService', 'Failed to parse response from /api/v1/profile.');

jslogger.downloadLogs('session.log');
```

```text
Mon Aug 12 2019 22:37:57 | JSLogger | [AuthService] :: Authentication successful: User "Suhaib Janjua" loggedin.
Mon Aug 12 2019 22:37:57 | JSLogger | [AuthService] :: Profile for "Suhaib Janjua" synced successfully.
Mon Aug 12 2019 22:37:57 | JSLogger | [TokenService] :: Access token expires in 60 seconds.
Mon Aug 12 2019 22:37:57 | JSLogger | [ApiService] :: Failed to parse response from /api/v1/profile.
```

### Anatomy of a log line

Every method takes exactly **two arguments** — a `process` label and a `message`.

```text
Mon Aug 12 2019 22:37:57 │ JSLogger │ [AuthService] :: Authentication successful…
└──────── timestamp ────┘ └ appName ┘ └── process ──┘     └────── message ──────┘
      automatic            setAppName()   argument 1          argument 2
```

<sub>📅 Every example in this README is timestamped <code>Mon Aug 12 2019 22:37:57</code> — the day this logger was first designed and written. Your own logs carry the real time of the call.</sub>

---

## 📚 API reference

Every example below assumes `jslogger.setAppName('JSLogger')` has been called.

### Logging methods

All seven share one signature: `(process, message)`. `message` may be a **string or an
object**; objects are redacted by key, then serialised.

| Method | Console | In-memory buffer |
| --- | --- | --- |
| [`info`](#info) | ⚫ black | ✅ |
| [`success`](#success) | 🟢 green | ✅ |
| [`warning`](#warning) | 🟠 orange | ✅ |
| [`error`](#error) | 🔴 red | ✅ |
| [`debug`](#debug) | 🔵 blue — **only if verbose** | ✅ always |
| [`internal`](#internal) | 🚫 never printed | ✅ |
| [`log`](#log) | ⚫ alias for `info` | ✅ |

---

#### `info`

General application flow. Printed in black, and recorded.

```js
let username = 'Suhaib Janjua';
jslogger.info('AuthService', `Authentication successful: User "${username}" loggedin.`);
```

```text
Mon Aug 12 2019 22:37:57 | JSLogger | [AuthService] :: Authentication successful: User "Suhaib Janjua" loggedin.
```

---

#### `success`

An operation completed. Printed in green.

```js
jslogger.success('AuthService', `Profile for "${username}" synced successfully.`);
```

```text
Mon Aug 12 2019 22:37:57 | JSLogger | [AuthService] :: Profile for "Suhaib Janjua" synced successfully.
```

---

#### `warning`

Something recoverable needs attention. Printed in orange.

```js
jslogger.warning('TokenService', 'Access token expires in 60 seconds.');
```

```text
Mon Aug 12 2019 22:37:57 | JSLogger | [TokenService] :: Access token expires in 60 seconds.
```

---

#### `error`

Something failed. Printed in red.

```js
jslogger.error('ApiService', 'Failed to parse response from /api/v1/profile.');
```

```text
Mon Aug 12 2019 22:37:57 | JSLogger | [ApiService] :: Failed to parse response from /api/v1/profile.
```

---

#### `debug`

Development detail. **Always recorded in the buffer**, but only printed to the console
when verbose mode is on — so you can keep debug output out of a production console
while still capturing it in the downloadable file.

```js
jslogger.debug('TokenService', 'Token refresh initiated.');
// VERBOSE is false by default → nothing in the console…
console.log(jslogger.getEntryCount()); // → 1  …but it IS in the buffer
```

```text
(no console output)
```

```js
jslogger.setLevelToVerbose(true);
jslogger.debug('TokenService', 'Token refresh initiated.');
```

```text
Mon Aug 12 2019 22:37:57 | JSLogger | [TokenService] :: Token refresh initiated.
```

---

#### `internal`

Recorded in the buffer and included in the download, but **never printed to the
console**. Use it to keep noisy diagnostics out of the user's console view while
still capturing them for the log file.

```js
jslogger.internal('AuthService', 'Session 4f2a opened for user 4821; refresh scheduled in 3600s.');
```

```text
(no console output — but present in getLogs() and the downloaded file)

Mon Aug 12 2019 22:37:57 | JSLogger | [AuthService] :: Session 4f2a opened for user 4821; refresh scheduled in 3600s.
```

> ⚠️ **`internal()` is a noise-control tool, not a security boundary.** The entry still
> enters the buffer and still appears in the downloaded file. What protects sensitive
> values is [redaction](#-redaction), which runs on every method alike.

---

#### `log`

Alias for `info`.

```js
let username = 'Suhaib Janjua';
jslogger.log('AuthService', `Authentication successful: User "${username}" loggedin.`);
```

```text
Mon Aug 12 2019 22:37:57 | JSLogger | [AuthService] :: Authentication successful: User "Suhaib Janjua" loggedin.
```

---

#### Logging an object

Pass an object instead of a string and it is redacted by key, then serialised:

```js
jslogger.info('AuthService', { user: 'Suhaib Janjua', role: 'admin', password: 'hunter2' });
```

```text
Mon Aug 12 2019 22:37:57 | JSLogger | [AuthService] :: {"user":"Suhaib Janjua","role":"admin","password":"[REDACTED]"}
```

---

### Configuration

#### `setAppName(name)`

Sets the prefix on every line. Default is `ColorJSLogger`.

```js
jslogger.info('AuthService', 'Connection in progress');   // before
jslogger.setAppName('JSLogger');
jslogger.info('AuthService', 'Connection in progress');   // after
```

```text
Mon Aug 12 2019 22:37:57 | ColorJSLogger | [AuthService] :: Connection in progress
Mon Aug 12 2019 22:37:57 | JSLogger | [AuthService] :: Connection in progress
```

Non-string or empty input is rejected, keeping the previous name:

```js
jslogger.setAppName('');
```

```text
ColorJSLogger: Invalid app name provided
```

---

#### `setLevelToVerbose(isVerbose)`

Controls whether [`debug()`](#debug) reaches the console. Default `false`. Coerced with
`Boolean()`, so any truthy value enables it.

```js
jslogger.setLevelToVerbose(true);
jslogger.debug('TokenService', 'Token refresh initiated.');
```

```text
Mon Aug 12 2019 22:37:57 | JSLogger | [TokenService] :: Token refresh initiated.
```

---

#### `setMaxEntries(n)` · `getMaxEntries()`

Sets how many entries are retained before the oldest are evicted. Default **2000**.

```js
jslogger.setMaxEntries(3);
for (let i = 1; i <= 5; i++) jslogger.info('Loop', `entry-${i}`);

console.log(jslogger.getEntryCount());  // → 3
console.log(jslogger.getLogs());
```

```text
Mon Aug 12 2019 22:37:57 | JSLogger | [Loop] :: entry-3
Mon Aug 12 2019 22:37:57 | JSLogger | [Loop] :: entry-4
Mon Aug 12 2019 22:37:57 | JSLogger | [Loop] :: entry-5
```

`entry-1` and `entry-2` were evicted — oldest first. Nonsense values are rejected and
leave the current cap untouched:

```js
jslogger.setMaxEntries(0);        // also: -5, '100', null, NaN, Infinity
console.log(jslogger.getMaxEntries());  // → 2000, unchanged
```

```text
ColorJSLogger: setMaxEntries() expects a positive number; ignoring
```

---

### Reading and downloading

#### `getLogs()`

Returns the retained window as one string, oldest first, newline-separated.

```js
jslogger.info('AuthService', `User "${username}" loggedin.`);
jslogger.info('ApiService', 'Profile loaded.');

console.log(jslogger.getLogs());
```

```text
Mon Aug 12 2019 22:37:57 | JSLogger | [AuthService] :: User "Suhaib Janjua" loggedin.
Mon Aug 12 2019 22:37:57 | JSLogger | [ApiService] :: Profile loaded.
```

---

#### `getEntryCount()`

How many entries are currently retained.

```js
console.log(jslogger.getEntryCount());
```

```text
2
```

---

#### `downloadLogs(filename?)`

Builds a `Blob` from `getLogs()` and triggers a browser download. **Entirely local** —
no upload, no server, no network. Outside a browser it warns and does nothing.

```js
jslogger.downloadLogs();                // JSLogger-Mon Aug 12 2019 22:37:57.log
jslogger.downloadLogs('session.log');   // explicit filename
```

The saved file contains exactly the retained window:

```text
Mon Aug 12 2019 22:37:57 | JSLogger | [AuthService] :: User "Suhaib Janjua" loggedin.
Mon Aug 12 2019 22:37:57 | JSLogger | [ApiService] :: Profile loaded.
```

In Node (or any environment without `document`):

```text
ColorJSLogger: downloadLogs() is only available in browser environments
```

---

#### `clearLogs()`

Empties the buffer.

```js
jslogger.clearLogs();
console.log(jslogger.getEntryCount());  // → 0
console.log(jslogger.getLogs());        // → '' (empty string)
```

---

### Metadata

#### `version()` · `about()`

```js
console.log(jslogger.version());
console.log(jslogger.about());
```

```text
5.0.0
Website: https://github.com/suhaibjanjua/colorjslogger 
 Copyright: (c) 2019-2025 Suhaib Janjua
```

---

## 🛡️ Redaction

Credentials are stripped **at capture** — before the entry reaches the buffer. The
buffer, the console, and the downloaded file all observe the same redacted string.
Redaction is never a display-time filter, so there is no code path where a raw value
sits in memory waiting to be exported.

Two layers run on every entry.

### 1. Object payloads — matched by key

Recursive through nested objects and arrays, case-insensitive, matched as substrings so
`token` also catches `access_token` and `refreshToken`. Your original object is never
mutated, and circular references are handled rather than thrown.

Redacted by default: `authorization`, `x-rainbow-app-auth`, `x-rainbow-api-key`,
`password`/`pass`, `token`, `secret`, `code`.

```js
jslogger.info('AuthService', { user: 'Suhaib Janjua', role: 'admin', password: 'hunter2' });
```

```text
Mon Aug 12 2019 22:37:57 | JSLogger | [AuthService] :: {"user":"Suhaib Janjua","role":"admin","password":"[REDACTED]"}
```

### 2. Composed lines — matched by shape

Catches secrets interpolated into a string before the library ever saw them: key shapes
(`token=…`, `password: …`) and value shapes (`Bearer …`, `Basic …`, bare JWTs).

```js
jslogger.internal('TokenService', `token=${accessToken}`);
```

```text
Mon Aug 12 2019 22:37:57 | JSLogger | [TokenService] :: token=[REDACTED]
```

```js
jslogger.internal('ApiService', `Authorization: Basic ${btoa('suhaib:hunter2')}`);
```

```text
Mon Aug 12 2019 22:37:57 | JSLogger | [ApiService] :: Authorization: [REDACTED]
```

Value-shape rules are deliberately narrow — there is no generic "long base64 blob"
heuristic — so UUIDs, git SHAs and request IDs survive intact:

```js
jslogger.info('ApiService', 'requestId=550e8400-e29b-41d4-a716-446655440000');
```

```text
Mon Aug 12 2019 22:37:57 | JSLogger | [ApiService] :: requestId=550e8400-e29b-41d4-a716-446655440000
```

### `addRedactedKeys(keys)`

Extend the deny-list. Strings match case-insensitively as substrings; pass a `RegExp`
for exact control.

```js
jslogger.addRedactedKeys(['ssn', 'account_number', /^pin$/i]);
jslogger.info('Profile', { user: 'Suhaib Janjua', ssn: '123-45-6789' });
```

```text
Mon Aug 12 2019 22:37:57 | JSLogger | [Profile] :: {"user":"Suhaib Janjua","ssn":"[REDACTED]"}
```

### `setRedactionMode(mode)` · `setAllowedKeys(keys)`

Blacklist mode is the default because it is safe with no configuration. Whitelist mode
inverts it: **only** approved keys survive, including fields you never anticipated.

```js
jslogger.setAllowedKeys(['user', 'status']);
jslogger.setRedactionMode('whitelist');

jslogger.info('ApiService', {
  user: 'Suhaib Janjua',
  status: 200,
  sessionKey: 'sk_live_abc123',
  ip: '10.0.0.4',
});
```

```text
Mon Aug 12 2019 22:37:57 | JSLogger | [ApiService] :: {"user":"Suhaib Janjua","status":200,"sessionKey":"[REDACTED]","ip":"[REDACTED]"}
```

Note `ip` — never deny-listed, but redacted anyway because it is not on the allow-list.
That is the point of whitelist mode. Allow-list entries match the **whole** key,
case-insensitively; call `setAllowedKeys()` *before* switching modes or every field
comes out redacted.

### `resetRedaction()`

Restores the built-in blacklist defaults, discarding any custom keys, mode, or
allow-list.

```js
jslogger.resetRedaction();
```

---

## 🔐 Security

**Redact-at-capture guarantee.** Every log method funnels through one code path that
composes the entry, redacts it, and only then writes it to the buffer. The buffer never
holds a raw sensitive value, so the downloaded file cannot leak one that redaction
matched.

**What redaction cannot do.** Both layers are key- and shape-based, and no such scheme
can catch a secret in free-form prose that carries neither:

```js
jslogger.info('AuthService', 'the password is hunter2');
```

```text
Mon Aug 12 2019 22:37:57 | JSLogger | [AuthService] :: the password is hunter2
```

There is no key to match and no recognisable credential shape. Redaction is a safety
net for realistic accidents — a stringified request body, an interpolated header, a
logged options object — not a guarantee that anything you pass will be sanitised.
**What you choose to log remains your responsibility.**

Known limits, stated plainly:

- Prose containing a bare secret is not caught (above).
- Opaque credentials with no key and no distinctive shape — a raw session ID, an API key
  that looks like any other random string — are not caught. Register their key names via
  `addRedactedKeys()`, or use whitelist mode.
- Substring key matching over-redacts by design: `code` also matches `zipcode`.
  Over-redacting is the safe direction.
- Redaction applies to what you pass in. It cannot reach a secret already concatenated
  into a string in a shape it does not recognise.

**No client-side logger is a secure store.** The buffer is plain JavaScript memory in
the user's browser: readable from the console, from any script on the page, and from any
extension with page access. The downloaded file is plaintext on disk. Redaction reduces
the blast radius of logs you ship around — attached to a support ticket, pasted into a
chat — it does not make the browser a safe place to keep secrets. Treat anything
reaching the client as already disclosed to the user, and keep real secrets server-side.

To report a vulnerability, see [SECURITY.md](SECURITY.md).

---

## 🧩 TypeScript

Definitions ship with the package — nothing extra to install.

```ts
import jslogger, { type RedactionMode } from 'colorjslogger';

jslogger.setAppName('JSLogger');
jslogger.setMaxEntries(500);

const mode: RedactionMode = 'whitelist';
jslogger.setRedactionMode(mode);

const retained: number = jslogger.getEntryCount();
```

---

## 🎮 Demo

**[▶ Live demo](https://suhaibjanjua.github.io/colorjslogger/examples/demo.html)** — open
your browser console to see the colored output, then try the download button.

```bash
npm run demo   # node examples/node-demo.js
```

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

```bash
npm install
npm test        # lint + typecheck + jest
npm run build   # UMD + ESM + types into dist/
```

---

## 📄 License

MIT — see [LICENSE.md](LICENSE.md).

<div align="center">
<sub>Built by <b><a href="http://www.suhaibjanjua.com/">Suhaib Janjua</a></b> · since Mon Aug 12 2019 · Copyright © 2019–2025</sub>
</div>
</content>
