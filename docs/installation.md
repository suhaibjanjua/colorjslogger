## Installation

### NPM

```bash
$ npm install colorjslogger
```

### Yarn

```bash
$ yarn add colorjslogger
```

### Bundlers (Vite, React, webpack, Rollup)

The package has a **default export**; TypeScript definitions ship with it.

```js
import jslogger from 'colorjslogger';

jslogger.info('JSLOGGER', 'Imported via a bundler');
```

### Script tag (CDN)

The UMD build exposes the global `ColorJSLogger` (with `jslogger` as a legacy
alias):

```html
<script src="https://cdn.jsdelivr.net/npm/colorjslogger@5.0.0/dist/jslogger.min.js"></script>
<script>
  ColorJSLogger.info('JSLOGGER', 'Loaded from the CDN');
</script>
```

### ES modules in the browser, no bundler

```html
<script type="module">
  import jslogger from 'https://cdn.jsdelivr.net/npm/colorjslogger@5.0.0/dist/jslogger.esm.js';

  jslogger.info('JSLOGGER', 'Imported as an ES module directly in the browser');
</script>
```

Pin the version rather than using `@latest`, so a future major cannot change
behaviour under a cached page.
