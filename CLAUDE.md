# CLAUDE.md — ColorJSLogger

Persistent repo memory. Read this first, before the README.

> **The README is not a source of truth.** It was AI-generated from filenames and
> contains inferred/fabricated claims (UglifyJS, `jslogger.warn()`, redacting
> `internal()`). Where README and code disagree, **the code wins**. Phase 3 of the
> 2026-07-17 session rewrites it; until then treat it as fiction.

---

## Project overview

ColorJSLogger is a dependency-free JavaScript logging library for browsers (and
Node, degraded). It prints CSS-coloured `console.log` output at five levels, prefixes
every line with a configurable app name, keeps every line it has ever emitted in an
in-memory buffer, and can hand that buffer to the user as a downloadable `.log` file.

Everything lives in a single object literal in [src/jslogger.js](src/jslogger.js).
~260 lines, no dependencies, no classes, no instances — it is a **singleton module
object**. There is no `new ColorJSLogger()`.

## Real public API

Derived from [src/jslogger.js](src/jslogger.js), not the README.

Every log method takes exactly **two string arguments** — `(process, message)`.
`process` is a free-text module/function label, not a Node `process`. There is no
varargs, no `console.log`-style object splatting.

| Member | Signature | Actual behaviour |
| --- | --- | --- |
| `info` | `(process, message) => void` | Buffer + console, black |
| `error` | `(process, message) => void` | Buffer + console, red |
| `success` | `(process, message) => void` | Buffer + console, green |
| `warning` | `(process, message) => void` | Buffer + console, orange |
| `debug` | `(process, message) => void` | Buffer **always**; console only if `VERBOSE`, blue |
| `internal` | `(process, message) => void` | Buffer only, **never** console. No redaction. |
| `log` | `(process, message) => void` | Alias for `info` |
| `downloadLogs` | `(filename?) => void` | Blob-downloads the raw buffer string. Warns + no-ops if `document` is undefined |
| `setLevelToVerbose` | `(isVerbose) => void` | `VERBOSE = Boolean(isVerbose)` |
| `setAppName` | `(name) => void` | Trims + sets; `console.warn`s and keeps old value on non-string/empty |
| `version` | `() => string` | **Hardcoded `'4.0.0'`** — stale, package.json says 4.0.4 |
| `about` | `() => string` | Static website/copyright string |
| `clearLogs` | `() => void` | `objLogs = ''` |
| `getLogs` | `() => string` | Returns the raw buffer string |
| `VERBOSE` | `boolean` | Public mutable property, default `false` |
| `appName` | `string` | Public mutable property, default `'ColorJSLogger'` |
| `objLogs` | `string` | Public mutable property — **the entire log buffer** |
| `useIE11` | `boolean?` | Only set (to `true`) when IE11 is sniffed at module load |

There is **no** `warn()`, no `fatal()`, no `trace()`, no redaction API, no buffer cap,
no log-level filtering beyond the `VERBOSE` gate on `debug`.

### Export shape

- **Source** ends with `export default ColorJSLogger` and *also* runs a runtime
  `module.exports` / `window.*` sniff at [src/jslogger.js:248-256](src/jslogger.js#L248-L256).
  That sniff survives into both bundles — see Known issues.
- **UMD** (`dist/jslogger.js`, `dist/jslogger.min.js`, `rollup.config.js`):
  global name is **`ColorJSLogger`** via the Rollup wrapper, built with
  `exports: 'default'` so the module *is* the logger object, not `{default: …}`.
  In a script-tag context the inner sniff additionally sets `window.jslogger` as a
  legacy alias. Both globals work; `ColorJSLogger` is canonical.
- **ESM** (`dist/jslogger.esm.js`, `rollup.config.esm.js`): `export { ColorJSLogger as default }`.
  Bundler consumers write `import jslogger from 'colorjslogger'` — **default import,
  no braces**. There is no named export of the logger.
- **package.json fields**: `main` → `dist/jslogger.js` (UMD, CJS-compatible),
  `module` → `dist/jslogger.esm.js`, `browser` → `dist/jslogger.umd.js` (**broken —
  that file is never built**), `types` → `dist/index.d.ts` (**broken — never emitted**).
  There is **no `exports` field**, so subpath/condition resolution is unconstrained.

## Architecture notes

Single buffer, and it is a **string, not an array**:

```
info/error/success/warning/log ─┐
                                ├─→ _log(process, message, level)
debug (VERBOSE=true) ───────────┘        │
                                         ├─→ objLogs += printLog + '\n'   ← buffer write
                                         └─→ console.log('%c '+printLog, 'color:…')
debug (VERBOSE=false) ──→ (inlined copy) ─→ objLogs += printLog + '\n'   ← buffer only
internal ───────────────→ (inlined copy) ─→ objLogs += printLog + '\n'   ← buffer only

getLogs()      → returns objLogs verbatim
downloadLogs() → new Blob([objLogs]) → <a download> → click()
```

- The line format is built once, in three places, as
  `` `${utc(new Date())} | ${appName} | [${process}] :: ${message}` ``
  ([_log:64](src/jslogger.js#L64), [internal:122](src/jslogger.js#L122),
  [debug:135](src/jslogger.js#L135)). Three copies of the same template — any format
  change must touch all three.
- **`internal()` differs from `_log()` only by omitting the `console.log` call.**
  That is the entire "confidential" path. It is console-suppression, not redaction.
- **Redaction today: none.** There is no redaction code anywhere in `src/`. The
  `docs/confidential-logs.md` example (`'User with email su****...com just logged in.'`)
  shows the **caller** pre-masking the string by hand. The library never inspects,
  filters, or transforms a message.
- Because the buffer is a string, an object argument would stringify to
  `[object Object]` — object payloads are not supported today.

## Build & release

- **Bundler is Rollup 3**, not UglifyJS. The README's UglifyJS claim is fabricated.
  Minification is `@rollup/plugin-terser`.
- `rollup.config.js` → UMD, two outputs: `dist/jslogger.js` (unminified) and
  `dist/jslogger.min.js` (terser). Both `name: 'ColorJSLogger'`, `exports: 'default'`.
- `rollup.config.esm.js` → one output, `dist/jslogger.esm.js`, `format: 'es'`,
  `modules: false` in preset-env so ESM survives. Otherwise **identical** to the UMD
  config (same input, same nodeResolve, same babel targets) — the two files exist only
  because of the `modules: false` flag and could be one config with three outputs.
- `npm run build` = `clean` → `build:umd` → `build:esm` → `build:types`.
- **`build:types` emits nothing.** `tsc --declaration --emitDeclarationOnly` over a
  `tsconfig.json` with no `allowJs` and a `src/` containing zero `.ts` files produces
  no output. `dist/index.d.ts` has never existed. `src/index.d.ts` is hand-written,
  accurate, and **not shipped** (not in `files`, and `types` points elsewhere).
  So: **no types reach npm consumers today**, despite the `typescript` keyword.
- `npm test` = `pretest` (eslint) → `jest`. `jest.config.js` uses
  `testEnvironment: 'node'`; `jest-environment-jsdom` is installed but unused, which
  is why the `downloadLogs()` browser path is untested.
- CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs lint/test/build on
  Node 16/18/20, then auto-tags, auto-releases, and **auto-publishes to npm on any
  push to master where `package.json`'s version line changed**. Bumping the version
  and pushing *is* a release. Treat version bumps as live ammunition.

## Known issues / security invariants

### Invariants — do not regress these

> **1. Secrets must be redacted BEFORE entering the log buffer — never at display
> time. The buffer must never hold a raw sensitive value.**
> Redaction belongs at capture, in the one place that builds the entry, before any
> write to the buffer. `getLogs()`, `downloadLogs()`, and the console must all be
> downstream of it and must never re-derive from an unredacted source. If a future
> change adds a fourth path that formats an entry, it must route through the same
> capture-time redaction.

> **2. `internal()` is not a security feature.** It suppresses console output only.
> Anything passed to it still lands in the buffer and still lands in the downloaded
> file. Never document it as redaction.

> **3. The buffer is bounded.** It must not grow without limit for the lifetime of
> the page.

### Open defects (as of 2026-07-17 Phase 0)

1. **No redaction exists.** Confirmed by Phase 1 trace — see session log.
2. **Unbounded buffer.** `objLogs` is an ever-growing string; a long-lived SPA leaks
   memory until reload. No cap, no eviction.
3. `version()` returns a hardcoded `'4.0.0'`; package.json is `4.0.4`.
4. `package.json` `browser` → `dist/jslogger.umd.js`, a file no config emits.
   Bundlers honouring the `browser` field will fail to resolve.
5. `types` → `dist/index.d.ts`, never emitted. Types do not ship.
6. `debug()` writes to the buffer even when `VERBOSE` is false, so
   `docs/README.md`'s "disable VERBOSE to avoid confidential logs in production"
   is false — the logs are merely hidden from the console and still export.
7. Local `npm run lint` fails with 438 CRLF errors: `core.autocrlf=true` on this
   machine, index is LF, prettier is `endOfLine: 'lf'`, and there is no
   `.gitattributes`. CI (Linux) is unaffected. Run `npx jest` to bypass `pretest`.
8. CDN examples in `README.md` and `docs/installation.md` point at
   `.../colorjslogger@<ver>/src/jslogger.min.js` — that path does not exist in the
   published tarball (`files` ships `src/jslogger.js` only; the minified build is
   `dist/jslogger.min.js`). Every CDN snippet in the repo is a 404.
9. `SECURITY.md` claims 3.x is supported; the library is 4.x.
10. The runtime `module.exports`/`window` sniff at [src/jslogger.js:248-256](src/jslogger.js#L248-L256)
    is baked into the ESM bundle too, where it is dead weight and a bundler smell.
11. Coverage is 70% stmts / 58% branch. Uncovered: the `console.log.apply` fallback,
    the whole `downloadLogs()` browser path, the IE11 sniff, the export sniff.

## Conventions

- Plain ES2018+ JS, single object literal, JSDoc on every public member — **keep the
  JSDoc**, it is the only real API doc.
- Prettier: 2-space, single quotes, semicolons, 80 cols, LF. ESLint extends
  `eslint:recommended` + prettier; `no-console` deliberately off; `prefer-const`,
  `no-var` enforced.
- Tests: Jest, `src/__tests__/*.test.js`, `require()`-style import of the source
  (CJS via babel-jest). Tests reset state by assigning `objLogs`/`appName`/`VERBOSE`
  directly in `beforeEach` — public mutable properties are load-bearing for the suite.
- `docs/` is a flat set of one-topic Markdown files, each mapping to one feature
  (`set-appname.md`, `download.md`, `confidential-logs.md`, `usage.md`, `example.md`,
  `installation.md`), plus `index.html` + `README.md` for the GitHub Pages site.
  A new user-facing feature should get a matching `docs/*.md`.
- Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`) — see `git log`.
- Releases are automated off the version line in `package.json`. Never bump casually.

## Session log

- **2026-07-17 — Phase 0** — Repo recon; created this file. Established the real API
  and export shape from source; catalogued 11 defects and the README's fabrications.
</content>
