#!/usr/bin/env node

/**
 * ColorJSLogger Node.js Example
 * 
 * This example demonstrates how to use ColorJSLogger in a Node.js environment.
 * Note: Some browser-specific features like downloadLogs() won't work in Node.js.
 */

const ColorJSLogger = require('../dist/jslogger.js');

console.log('=== ColorJSLogger Node.js Example ===\n');

// Set application name
ColorJSLogger.setAppName('NodeJSExample');

// Basic logging
ColorJSLogger.info('Startup', 'Application is starting up...');
ColorJSLogger.success('Database', 'Connected to database successfully');
ColorJSLogger.warning('Cache', 'Cache is 80% full');
ColorJSLogger.error('Network', 'Failed to connect to external API');

// Debug logging (not visible unless VERBOSE is true)
ColorJSLogger.debug('Debug', 'This debug message is stored but not displayed');

// Enable verbose mode
ColorJSLogger.setLevelToVerbose(true);
ColorJSLogger.debug('Debug', 'This debug message is now visible!');

// Internal logging (stored but not displayed)
ColorJSLogger.internal('Internal', 'This is an internal message');

// Log alias
ColorJSLogger.log('System', 'This uses the log alias (same as info)');

// Show version and about info
console.log('\nLibrary Info:');
console.log('Version:', ColorJSLogger.version());
console.log('About:', ColorJSLogger.about());

// Show stored logs
console.log('\n=== Stored Logs ===');
console.log(ColorJSLogger.getLogs());

// Clear logs
ColorJSLogger.clearLogs();
console.log('\n=== After clearing logs ===');
console.log('Logs length:', ColorJSLogger.getLogs().length);

console.log('\n=== Example completed ===');