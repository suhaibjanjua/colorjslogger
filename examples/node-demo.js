#!/usr/bin/env node

/**
 * ColorJSLogger Node.js Example
 * 
 * This example demonstrates how to use ColorJSLogger in a Node.js environment.
 * Note: Some browser-specific features like downloadLogs() won't work in Node.js.
 */


const JSLogger = require('../dist/jslogger.js');

console.log('=== ColorJSLogger Node.js Example ===\n');

// Set application name
JSLogger.setAppName('NodeJSExample');

// Basic logging
JSLogger.info('Startup', 'Application is starting up...');
JSLogger.success('Database', 'Connected to database successfully');
JSLogger.warning('Cache', 'Cache is 80% full');
JSLogger.error('Network', 'Failed to connect to external API');

// Debug logging (not visible unless VERBOSE is true)
JSLogger.debug('Debug', 'This debug message is stored but not displayed');

// Enable verbose mode
JSLogger.setLevelToVerbose(true);
JSLogger.debug('Debug', 'This debug message is now visible!');

// Internal logging (stored but not displayed)
JSLogger.internal('Internal', 'This is an internal message');

// Log alias
JSLogger.log('System', 'This uses the log alias (same as info)');

// Show version and about info
console.log('\nLibrary Info:');
console.log('Version:', JSLogger.version());
console.log('About:', JSLogger.about());

// Show stored logs
console.log('\n=== Stored Logs ===');
console.log(JSLogger.getLogs());

// Clear logs
JSLogger.clearLogs();
console.log('\n=== After clearing logs ===');
console.log('Logs length:', JSLogger.getLogs().length);

console.log('\n=== Example completed ===');