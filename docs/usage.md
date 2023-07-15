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