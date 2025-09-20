#!/usr/bin/env node

/**
 * ColorJSLogger Node.js Example
 * 
 * This example demonstrates how to use ColorJSLogger in a Node.js environment.
 * Note: Some browser-specific features like downloadLogs() won't work in Node.js.
 */

const jslogger = require('../dist/jslogger.js');

console.log('=== ColorJSLogger Node.js Example ===\n');

// Set application name
jslogger.setAppName('NodeJSExample');

// Basic logging
jslogger.info('Startup', 'Application is starting up...');
jslogger.success('Database', 'Connected to database successfully');
jslogger.warning('Cache', 'Cache is 80% full');
jslogger.error('Network', 'Failed to connect to external API');

// Debug logging (not visible unless VERBOSE is true)
jslogger.debug('Debug', 'This debug message is stored but not displayed');

// Enable verbose mode
jslogger.setLevelToVerbose(true);
jslogger.debug('Debug', 'This debug message is now visible!');

// Internal logging (stored but not displayed)
jslogger.internal('Internal', 'This is an internal message');

// Log alias
jslogger.log('System', 'This uses the log alias (same as info)');

// Show version and about info
console.log('\nLibrary Info:');
console.log('Version:', jslogger.version());
console.log('About:', jslogger.about());

// Show stored logs
console.log('\n=== Stored Logs ===');
console.log(jslogger.getLogs());

// Clear logs
jslogger.clearLogs();
console.log('\n=== After clearing logs ===');
console.log('Logs length:', jslogger.getLogs().length);

console.log('\n=== Example completed ===');