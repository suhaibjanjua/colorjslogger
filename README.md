# colorjslogger

[![npm version](https://badge.fury.io/js/colorjslogger.svg)](https://www.npmjs.com/package/colorjslogger)
[![license](https://img.shields.io/npm/l/colorjslogger)](https://github.com/suhaibjanjua/colorjslogger/blob/master/LICENSE.md)

Fast and lightweight colorful JS Logger for the browser and Nodejs. It is a perfect logger that supports all browsers.

It allows to print color logs with pre-defined 5 levels of logging (`info`, `warning`, `error`, `success`, `debug`). You can enable the `VERBOSE` flag to print debug logs during the development phase and you can disable it by setting `VERBOSE` flag to false to avoid printing confidential logs in production.


## Features

- Fast and lightweight
- Supports multi-color for browser console logs
- Records all types of logs and allow download it as a file


## Requirements

- None


## Installation

### **NPM**

You can install colorjslogger as a dependency using NPM.

```bash
$ npm install colorjslogger --save
```


### **Yarn**

You can install colorjslogger as a dependency using Yarn.

```bash
$ yarn add colorjslogger
```


### **CDN**

json2csv plainjs modules is packaged as an ES6 modules.
If your browser supports modules, you can load json2csv plainjs modules directly on the browser from the CDN.

You can import the latest version:

```html
<script type="module">
  import jslogger from 'https://cdn.jsdelivr.net/npm/colorjslogger@latest/src/jslogger.min.js';

  jslogger.info('JSLOGGER', 'Imported ES6Module directly in the browser');
</script>
```

You can also select a specific version:

```html
<script type="module">
  import jslogger from 'https://cdn.jsdelivr.net/npm/colorjslogger@3.0.1/src/jslogger.min.js';

  jslogger.info('JSLOGGER', 'Imported ES6Module directly in the browser');
</script>
```


### Usage

```js
try {
    jslogger.info(process, message);
    jslogger.warning(process, message);
    jslogger.error(process, message);
    jslogger.success(process, message);
    jslogger.internal(process, message);
    jslogger.debug(process, message);
} catch (err) {
  console.error(err);
}
```

#### Parameters

* process (string): Name of the process or a function in which it is used.
* message (string): Actual log message that needs to log in the console.


#### Note

Debug logs will only work if the `VERBOSE` property is set to true. Here is an example how to do it:

```js
jslogger.setLevelToVerbose(true);
```


## Example

```js
jslogger.info('Authentication', 'Connection in progress');
```

#### Output

> Mon Aug 12 2019 22:37:57 | JSLogger | [Authentication] :: Connection in progress


#### Output Format

> Date and Time | AppName | [Process] :: Message


## Set AppName for logs

```js
jslogger.setAppName('SuhaibJanjuaLogger');
jslogger.info('Authentication', 'Connection in progress');
```

> Mon Aug 12 2019 22:37:57 | SuhaibJanjuaLogger | [Authentication] :: Connection in progress


## Prevent confidential information
Use the internal method to skip the confidential or sensitive data to appear in the console logs. It will be helpful to record the logs in the memory and will be a part of the log file when you [download](#download) it.

```js
jslogger.internal('Authentication', 'User with email su****************.com just logged in.');
```


## Download

You can download the recorded logs by the following method:

```js
jslogger.downloadLogs()
```

## License

See [LICENSE.md](https://github.com/suhaibjanjua/colorjslogger/blob/master/LICENSE.md).
