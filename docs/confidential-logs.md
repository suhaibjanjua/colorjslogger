## Confidential logs

### `internal()` — keep an entry out of the console

`internal()` records an entry in the buffer and in the [downloaded](#download)
file, but never prints it to the console.

```js
jslogger.internal('Authentication', 'User su****@example.com just logged in.');
```

It is a **noise-control tool, not a security boundary**. The entry still reaches
the buffer and still reaches the downloaded file. What protects sensitive values
is redaction, which runs on every log method alike.

### Redaction

Every entry is redacted **at capture** — before it enters the buffer — so the
in-memory history and the exported file never contain a raw value that redaction
matched.

```js
jslogger.internal('Auth', `token=${accessToken}`);
// buffered as: ... | [Auth] :: token=[REDACTED]

jslogger.internal('Api', { user: 'alice', password: 'hunter2' });
// buffered as: ... | [Api] :: {"user":"alice","password":"[REDACTED]"}
```

Redacted by default: `authorization`, `x-rainbow-app-auth`, `x-rainbow-api-key`,
`password`/`pass`, `token`, `secret`, `code`. Plus `Bearer <token>`,
`Basic <base64>` and bare JWTs wherever they appear in a message.

Extend the deny-list, or invert it into an allow-list:

```js
jslogger.addRedactedKeys(['ssn', /^pin$/i]);

jslogger.setAllowedKeys(['userId', 'status']);
jslogger.setRedactionMode('whitelist'); // only approved keys survive
```

Redaction cannot catch a secret in free-form prose that carries no key and no
recognisable shape (`'the password is hunter2'`). See the Security section of the
[README](https://github.com/suhaibjanjua/colorjslogger#security) for the full
list of limitations.
