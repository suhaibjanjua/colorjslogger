# colorjslogger

[![npm version](https://badge.fury.io/js/colorjslogger.svg)](https://www.npmjs.com/package/colorjslogger)
[![license](https://img.shields.io/npm/l/colorjslogger)](https://github.com/suhaibjanjua/colorjslogger/blob/master/LICENSE.md)

Fast and lightweight colorful JS Logger for the browser and Nodejs. It is a perfect logger that supports all browsers.

It allows to print color logs with pre-defined 5 levels of logging (`info`, `warning`, `error`, `success`, `debug`). Enable the `VERBOSE` flag to print debug logs during development, and disable it in production to keep them out of the console.

Sensitive values are redacted at capture, before they reach the log buffer, so the recorded history and the downloadable file never contain a raw token, password or auth header that redaction matched.


## Features

- Fast and lightweight
- Supports multi-color for browser console logs
- Records all types of logs and allow download it as a file


## Requirements

- None