# Security Policy

ColorJSLogger's job is to handle logs that may contain sensitive data. This
document covers what the library guarantees, what it explicitly does not, and
how to report a problem.

## Supported Versions

| Version | Supported | Notes |
| ------- | --------- | ----- |
| 5.x     | ✅        | Current. Redacts at capture. |
| 4.x     | ❌        | **No redaction of any kind.** See below. |
| <= 3.x  | ❌        | End of life. |

### Upgrade notice for 4.x and earlier

Versions before 5.0.0 performed **no redaction**. `internal()` suppressed
console output only — the raw message was written verbatim to the log buffer and
appeared in full in the file produced by `downloadLogs()`. Applications that
passed tokens, passwords or auth headers to any log method on 4.x or earlier
should assume those values are present in plaintext in any exported log file,
and treat previously collected logs accordingly.

Upgrade to 5.x. There is no patch for 4.x; the fix required restructuring how
entries are captured.

## What the library guarantees

**Redaction happens at capture.** Every log method routes through a single code
path that composes the entry, redacts it, and only then writes it to the buffer.
Redaction is never a display-time filter. The in-memory buffer, the console
output, and the downloaded file all observe the same already-redacted string.
There is no code path that retains a raw sensitive value after a log call
returns.

**Redaction is on by default.** The built-in deny-list requires no
configuration: `authorization`, `x-rainbow-app-auth`, `x-rainbow-api-key`,
`password`/`pass`, `token`, `secret`, and `code`, matched case-insensitively as
substrings; plus `Bearer <token>`, `Basic <base64>` and bare JWT shapes wherever
they appear in a message.

**Redaction does not corrupt your data.** Logged objects are cloned, never
mutated. Circular references are handled rather than thrown.

## What the library does not guarantee

These are known, accepted limitations. They are not vulnerabilities, and reports
describing them will be closed with a pointer here.

- **Free-form prose is not redacted.** `jslogger.info('Auth', 'the password is
  hunter2')` is logged verbatim. There is no key to match and no recognisable
  credential shape. No key- or shape-based scheme can catch this. What you
  choose to log remains your responsibility.
- **Opaque credentials are not redacted.** A session ID or API key with no
  associated key name and no distinctive shape is indistinguishable from any
  other random string. Register its key name with `addRedactedKeys()`, or use
  whitelist mode.
- **Value-shape matching is deliberately narrow.** There is no generic "long
  base64/hex blob" heuristic, because one would destroy UUIDs, git SHAs and
  request IDs. Precision is preferred over recall here.
- **Key matching over-redacts.** `code` also matches `zipcode`. This is the safe
  direction and is intentional.
- **A client-side logger is not a secure store.** The buffer is ordinary
  JavaScript memory in the user's browser: readable from the devtools console,
  from any script on the page, and from any extension with page access. The
  downloaded file is plaintext on the user's disk. Redaction reduces the blast
  radius of logs that get shared — attached to a support ticket, pasted into a
  chat — it does not make the browser a safe place to keep secrets. Treat
  anything reaching the client as already disclosed to the user.

If your threat model needs more than the default, enable whitelist mode so that
only approved keys survive:

```js
jslogger.setAllowedKeys(['userId', 'status', 'durationMs']);
jslogger.setRedactionMode('whitelist');
```

The library provides the mechanism; the allow-list is your policy decision.

## Reporting a Vulnerability

**Do not open a public GitHub issue for a security vulnerability.**

Preferred: report privately via GitHub Security Advisories —
[Report a vulnerability](https://github.com/suhaibjanjua/colorjslogger/security/advisories/new).
This keeps the report private and gives us a coordinated channel to work in.

Alternatively, email [suhaib.janjua@gmail.com](mailto:suhaib.janjua@gmail.com)
with `[SECURITY] colorjslogger` in the subject.

Please include:

- A description of the issue and why you believe it is a security problem.
- The affected version, and a minimal reproduction (a code snippet is ideal).
- What an attacker gains — particularly, whether a raw sensitive value reaches
  the buffer, the console, or the exported file.
- Any suggested fix, if you have one.
- How you would like to be credited, if you want to be.

### What counts as a vulnerability here

The bar is the capture-time invariant. A report is in scope if it shows:

- a code path where a value matched by the active redaction policy reaches the
  buffer, the console, or the exported file in raw form;
- a way to make redaction mutate or corrupt a caller's object;
- a way to make a log call throw, hang, or exhaust memory on input an
  application would plausibly log (including ReDoS in the redaction patterns);
- a way to defeat the ring buffer's bound.

Also in scope: the build and release pipeline, and any documentation whose
inaccuracy would lead a reader to believe a value is protected when it is not.

## Response Timeline

- **Initial response**: within 48 hours.
- **Assessment**: within 7 days.
- **Fix**: we aim to resolve critical issues within 30 days, and to publish an
  advisory when one ships.

## Out of Scope

- The documented limitations listed above.
- Issues in development dependencies that do not affect the published package.
  The package has **zero runtime dependencies**; everything in `devDependencies`
  is build-time only.
- Theoretical vulnerabilities with no practical exploit scenario.
- Issues requiring unusual browser configurations.

## Recognition

We appreciate responsible disclosure and will credit researchers who help
improve ColorJSLogger's security, with their permission.
