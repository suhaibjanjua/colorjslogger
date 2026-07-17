# CLAUDE.md — ColorJSLogger

Persistent repo memory. Read this first, before the README.

> The README was rewritten from verified source on 2026-07-17, and every example in
> it was executed against a packed tarball before it shipped. It is accurate as of
> v5.0.0. **Keep it that way: if you change behaviour, run the README examples
> before claiming they still hold.** The pre-v5 README was AI-generated from
> filenames and invented UglifyJS, `jslogger.warn()` and a redacting `internal()`.
> When in doubt, the code is the authority.

---

## Project overview

ColorJSLogger is a dependency-free JavaScript logging library for browsers (and
Node, degraded). It prints CSS-coloured `console.log` output at five levels, prefixes
every line with a configurable app name, retains a bounded history in memory, and can
hand that history to the user as a downloadable `.log` file.

Since v5 it is also a **redacting** logger: every entry is scrubbed of credentials at
capture, before it reaches the buffer. That is the property the library exists to
guarantee — see [Security invariants](#security-invariants).

Two source files, no dependencies, no classes, no instances — the export is a
**singleton object literal**. There is no `new ColorJSLogger()`.

- [src/jslogger.js](src/jslogger.js) — the logger object, buffer, and public API.
- [src/redact.js](src/redact.js) — the redaction layer (pure functions, no state).

## Real public API

Derived from source, not the README.

Every log method takes exactly **two arguments** — `(process, message)`. `process` is
a free-text module/function label, not a Node `process`. `message` is a string or an
object (objects are key-redacted, then JSON-serialised). There is no varargs and no
`console.log`-style splatting.

### Logging

| Member | Signature | Behaviour |
| --- | --- | --- |
| `info` | `(process, message) => void` | Buffer + console, black |
| `error` | `(process, message) => void` | Buffer + console, red |
| `success` | `(process, message) => void` | Buffer + console, green |
| `warning` | `(process, message) => void` | Buffer + console, orange |
| `debug` | `(process, message) => void` | Buffer **always**; console only if `VERBOSE`, blue |
| `internal` | `(process, message) => void` | Buffer only, **never** console. Redacted like every other path. |
| `log` | `(process, message) => void` | Alias for `info` |

### Configuration

| Member | Signature | Behaviour |
| --- | --- | --- |
| `setAppName` | `(name) => void` | Trims + sets; warns and keeps old value on non-string/empty |
| `setLevelToVerbose` | `(isVerbose) => void` | `VERBOSE = Boolean(isVerbose)` |
| `setMaxEntries` | `(n) => void` | Ring cap; rejects non-numeric/non-finite/`<= 0` with a warning; floors fractions; evicts immediately when lowered |
| `getMaxEntries` | `() => number` | Current cap (default 2000) |
| `getEntryCount` | `() => number` | Retained entry count |
| `addRedactedKeys` | `(keys) => void` | Extend the deny-list; strings become case-insensitive **substring** patterns, RegExp passes through |
| `setRedactionMode` | `('blacklist'\|'whitelist') => void` | Default `'blacklist'` |
| `setAllowedKeys` | `(keys) => void` | Whitelist-mode allow-list; **whole-key** case-insensitive match |
| `resetRedaction` | `() => void` | Restore built-in defaults |

### Log access and metadata

| Member | Signature | Behaviour |
| --- | --- | --- |
| `getLogs` | `() => string` | Retained window, oldest first, newline-joined + trailing `\n` |
| `clearLogs` | `() => void` | Empties `_entries` |
| `downloadLogs` | `(filename?) => void` | Blobs `getLogs()`. Warns + no-ops if `document` is undefined |
| `version` | `() => string` | Hardcoded `'5.0.0'` — **must be bumped alongside package.json by hand** |
| `about` | `() => string` | Static website/copyright string |
| `VERBOSE` | `boolean` | Public mutable property, default `false` |
| `appName` | `string` | Public mutable property, default `'ColorJSLogger'` |
| `objLogs` | `string` | **Deprecated accessor.** Getter joins the ring; setter honours only `= ''` (clears) and warns otherwise |
| `useIE11` | `boolean?` | Only set (to `true`) when IE11 is sniffed at module load |

There is **no** `warn()`, no `fatal()`, no `trace()`, and no log-level filtering beyond
the `VERBOSE` gate on `debug`.

### Export shape

- **Source** ends with `export default ColorJSLogger` and *also* runs a runtime
  `module.exports` / `window.*` sniff. That sniff survives into both bundles.
- **UMD** (`dist/jslogger.js`, `dist/jslogger.min.js`): global name is
  **`ColorJSLogger`** via the Rollup wrapper, built with `exports: 'default'` so the
  module *is* the logger object, not `{default: …}`. In a script-tag context the inner
  sniff additionally sets `window.jslogger` as a legacy alias. Both work;
  `ColorJSLogger` is canonical.
- **ESM** (`dist/jslogger.esm.js`): `export { ColorJSLogger as default }`. Bundler
  consumers write `import jslogger from 'colorjslogger'` — **default import, no
  braces**. There is no named export of the logger.
- **package.json**: `main` → `dist/jslogger.js` (UMD, CJS-compatible), `module` →
  `dist/jslogger.esm.js`, `types` → `dist/index.d.ts`, plus an `exports` map with
  types/import/require conditions and a `./dist/*` passthrough. The `browser` field
  was **removed in v5** — it pointed at `dist/jslogger.umd.js`, which no config has
  ever built.

## Architecture notes

**One choke point.** Every entry is composed, redacted, and buffered in `_write()`
and nowhere else. This is the whole security design; do not add a second formatter.

```
info/success/warning/error/log ─┐
debug  (level only if VERBOSE) ─┼─→ _write(process, message, level?)
internal (no level, no console)─┘        │
                                         ├─ _render(message)
                                         │    └─ object? → redactValue() → JSON.stringify()
                                         ├─ compose: `${utc} | ${appName} | [${process}] :: ${rendered}`
                                         ├─ scrubString(line)          ← REDACTION AT CAPTURE
                                         ├─ _entries.push(entry)       ← buffer write (redacted)
                                         └─ level ? console.log('%c '+entry, colour) : skip
```

- `_entries` is a bounded `string[]` (oldest-first), capped by `_maxEntries`
  (default 2000), evicting via `shift()` on overflow.
- `getLogs()` joins the ring. `downloadLogs()` blobs `getLogs()` — it never touches
  `_entries` directly, so it cannot diverge from the retained window.
- `internal()` is `_write()` with no `level`, which is the only thing that suppresses
  console output. That is its entire behaviour.
- `objLogs` is a getter/setter kept for backward compatibility only.

**Redaction** ([src/redact.js](src/redact.js)) is two independent layers, both at
capture. It is a pure module — all policy lives in a config object owned by the logger
(`_redaction`), so the functions are trivially testable.

1. `redactValue(value, config)` — structural, key-based, for object payloads.
   Recursive, non-mutating (returns a clone), circular-safe (`WeakSet` of the *ancestor
   chain*; it `delete`s on the way out so shared-but-acyclic references are not
   mislabelled `[Circular]`). Blacklist and whitelist modes.
2. `scrubString(line, config)` — textual, over the composed line. Value-shape rules
   (`Bearer`, `Basic`, bare JWT) run **before** key-shape rules; reversing that order
   leaves base64 payloads exposed, because the key-shape value stops at the first
   space. A final pass collapses adjacent `[REDACTED]` markers, which both layers
   legitimately produce on the same span.

Key matching is deliberately **substring** (`/token/i` catches `access_token`), which
over-redacts (`/code/i` catches `zipcode`). That direction is intentional. The
allow-list, by contrast, is whole-key — an allow-list must not silently widen.

## Build & release

- **Bundler is Rollup 3**, not UglifyJS. Minification is `@rollup/plugin-terser`.
- **One config, three outputs** ([rollup.config.js](rollup.config.js)):
  `dist/jslogger.js` and `dist/jslogger.min.js` (UMD, `name: 'ColorJSLogger'`,
  `exports: 'default'`, the min one via terser), and `dist/jslogger.esm.js` (`es`).
  `rollup.config.esm.js` was merged into it in v5 — it differed only by
  `modules: false`, itself redundant because @rollup/plugin-babel already tells
  preset-env that static ESM is supported.
- `npm run build` = `clean` → `build:bundles` → `build:types`.
- **`build:types` copies `src/index.d.ts` → `dist/index.d.ts`.** It does not run tsc.
  tsc *cannot* emit here: tsconfig has no `allowJs` and `src/` has no `.ts` source, so
  `--emitDeclarationOnly` walked zero files and exited 0 having written nothing — which
  is why `types` pointed at a non-existent file for 22 releases. `src/index.d.ts` is
  hand-written; [src/__tests__/types.test.js](src/__tests__/types.test.js) is the drift
  guard that keeps it honest.
- `npm test` = `pretest` (`lint` + `typecheck`) → `jest`. `typecheck` runs `tsc
  --noEmit`, which is the only remaining job tsconfig.json has.
- Jest: `testEnvironment: 'node'` by default; `download.test.js` opts into jsdom via a
  `@jest-environment jsdom` docblock.
- CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs lint/test/build on
  Node 18/20/22, then auto-tags, auto-releases, and **auto-publishes to npm on any push
  to master where package.json's version line changed**. Bumping the version and
  pushing *is* a release. Treat version bumps as live ammunition.
- **Node 16 cannot build this project** — a transitive dep needs the global `crypto`
  added in Node 18. It was in the matrix until v5, so every CI run failed from April
  2026 until then, and every dependabot PR inherited a red check. `engines` says >=18.
- Jest enforces coverage thresholds (88% statements / 80% branches / 100% functions).

## Security invariants

Do not regress these. They are the reason v5 exists.

> **1. Secrets are redacted BEFORE entering the log buffer — never at display time.
> The buffer must never hold a raw sensitive value.**
> Redaction lives in `_write()`, the single place that composes an entry, and runs
> before the `_entries.push()`. The buffer, `getLogs()`, `downloadLogs()` and the
> console are all downstream and all observe the same redacted string. If you add a
> code path that formats an entry, it MUST route through `_write()`.

> **2. `internal()` is not a security feature.** It suppresses console output only.
> Anything passed to it still enters the buffer and still appears in the download.
> What protects it is the shared capture-time redaction. Never document it otherwise.

> **3. The buffer is bounded.** It must not grow without limit for the page lifetime.

> **4. Redaction never mutates the caller's object.** Consumers log live application
> state; corrupting it would be far worse than the logging bug being fixed.

> **5. Negative cases are part of the contract.** UUIDs, git SHAs and request IDs must
> survive. Do not add generic "long base64/hex blob" heuristics — precision over
> recall for value shapes. Tests in `redaction.test.js` enforce this.

### Documented, accepted limitations

Stated in the README's Security section; keep them there and keep them honest.

- Free-form prose with a bare secret (`'the password is hunter2'`) is **not** caught.
  No key- or shape-based scheme can. This is the consumer's responsibility.
- Opaque credentials with no key and no distinctive shape are not caught.
- Substring key matching over-redacts by design.
- A client-side logger is not a secure store. Buffer contents are readable by any
  script on the page; the download is plaintext on disk.

## Conventions

- Plain ES2018+ JS, single object literal, JSDoc on every public member — **keep the
  JSDoc**, it is a real part of the API docs.
- Prettier: 2-space, single quotes, semicolons, 80 cols, LF. ESLint extends
  `eslint:recommended` + prettier; `no-console` deliberately off; `prefer-const`,
  `no-var` enforced. `.gitattributes` forces LF — without it, `core.autocrlf=true`
  checkouts fail every prettier rule and `npm test` cannot run at all.
- Tests: Jest, `src/__tests__/*.test.js`, `require()`-style import (CJS via babel-jest).
  Security tests assert against `_entries` **directly** rather than through an
  accessor — a display-time filter must not be able to make them pass.
- `docs/` is a flat set of one-topic Markdown files, each mapping to one feature, plus
  `index.html` + `README.md` for the GitHub Pages site. A new user-facing feature
  should get a matching `docs/*.md`.
- Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`). Breaking changes get `!`
  and a `BREAKING CHANGE:` trailer.
- Releases are automated off the version line in package.json. Never bump casually.

## Known issues

Open, as of 2026-07-17:

1. `version()` is hardcoded and must be bumped by hand alongside package.json. It has
   drifted before (returned `4.0.0` while the package was `4.0.4`).
   `robustness.test.js` now pins them together, so drift fails the build — but the
   bump is still manual.
2. The runtime `module.exports`/`window` sniff at the bottom of `src/jslogger.js` is
   baked into the ESM bundle too, where it is dead weight and a bundler smell.
   Left alone in v5 because removing it would drop the `window.jslogger` legacy alias.
3. The IE11 sniff runs at module load and calls `warning()` — a side effect on import
   that writes an entry to the buffer before the consumer has configured anything,
   despite `browserslist` saying `not ie 11`. Probably deletable; left for the author.
4. Three dependabot PRs (#18 js-yaml, #19 babel/plugin-transform-modules-systemjs,
   #20 babel/core) are open against **devDependencies only**. The package has zero
   runtime dependencies, so none of them reach consumers. Their red checks were the
   Node 16 build failure, not the bumps; they should go green on a rebase now.
5. `redact.js` is bundled into the published output but is not part of the public
   API. Its functions are exported for the logger's use and for tests; treat them as
   internal.

## Session log

- **2026-07-17 — Phase 0** — Repo recon; created this file. Established the real API
  and export shape from source; catalogued 11 defects and the README's fabrications.
- **2026-07-17 — Phase 1** — Traced the confidential path. Verdict: **no redaction
  existed at all**, at capture or display. `internal()` wrote raw messages straight to
  the buffer; `downloadLogs()` blobbed it verbatim, so exported `.txt` files contained
  plaintext secrets. Recorded under Known issues at the time.
- **2026-07-17 — Phase 2** — `feat!`: redact-at-capture via a single `_write()` choke
  point; bounded ring buffer (2000, oldest-first); two-layer redaction (key-based for
  objects, string scan for composed lines) with blacklist/whitelist modes. Object
  payloads added additively; two-string signature unchanged. v5.0.0. Tests 16 → 74,
  mutation-checked. Also `fix(pkg)`: shipped types for the first time, removed the
  `browser` field pointing at a never-built file, added an `exports` map.
- **2026-07-17 — Phase 3** — README rewritten from verified source. Every example
  executed against a packed tarball first; two drafted claims were wrong (`grant_type`
  is a key not a value; overlapping layers double-marked) and were fixed — the second
  by collapsing adjacent markers in `scrubString()`. docs/ updated to match.
- **2026-07-17 — Phase 4** — Housekeeping. Found and fixed a **ReDoS in the key-shape
  pattern** (quadratic on separator-free input: 40KB took 3.4s, now 14ms) while
  writing the tests to back SECURITY.md's claims — the bound on the key length is
  load-bearing, do not remove it. Discovered CI had been red on master since April
  2026 (Node 16 cannot build); fixed the matrix and `engines`. Rewrote SECURITY.md
  around the capture-time invariant. Consolidated the rollup configs. Added coverage
  thresholds. Tests 16 → 100, coverage 70% → 90.5%.
</content>
