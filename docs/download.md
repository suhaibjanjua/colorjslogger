## Download

Download the retained logs as a text file:

```js
jslogger.downloadLogs();              // <appName>-<timestamp>.log
jslogger.downloadLogs('session.log'); // explicit filename
```

Outside a browser this warns and does nothing.

The buffer is a bounded ring — **2000 entries by default**, oldest evicted first
— and the download contains exactly the retained window.

```js
jslogger.setMaxEntries(500);
jslogger.getEntryCount();
jslogger.getLogs();   // same content, as a string
jslogger.clearLogs();
```

Everything in the file has already been [redacted](#confidential-logs) at
capture.
