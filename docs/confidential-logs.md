## Prevent confidential logs
Use the internal method to skip the confidential or sensitive data to appear in the console logs. It will be helpful to record the logs in the memory and will be a part of the log file when you [download](#download) it.

```js
jslogger.internal('Authentication', 'User with email su****************.com just logged in.');
```