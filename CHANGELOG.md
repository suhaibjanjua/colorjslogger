# CHANGELOG of colorjslogger

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [5.0.0] - 2026-07-23

Security release. Sensitive values are now redacted **before** they enter the log
buffer. Earlier versions performed no redaction at all — `internal()` only
suppressed console output, so `downloadLogs()` exported plaintext secrets. If you
logged tokens or passwords on 4.x or earlier, treat previously exported log files
as compromised.

### Security
- **Redact at capture.** Every log method routes through one choke point that
  composes, redacts, then buffers. The buffer, the console and `downloadLogs()`
  all observe the same redacted string; no raw value survives the call.
- **On by default.** Two layers: key-based redaction for object payloads
  (recursive, non-mutating, circular-safe), and a scan of the composed line for
  `token=…` / `password: …` key shapes and `Bearer` / `Basic` / bare-JWT value
  shapes. Deny-list: `authorization`, `x-rainbow-app-auth`, `x-rainbow-api-key`,
  `pass`/`password`, `token`, `secret`, `code`.
- **Whitelist mode** — opt in so only approved keys survive into the buffer.
- Fixed `debug()` bypassing redaction entirely when `VERBOSE` was false.
- Fixed a ReDoS in the key-shape pattern (40 KB input: 3.4 s → 14 ms).
- `SECURITY.md` rewritten with a disclosure process and honest limits on what
  redaction can and cannot catch.

### Added
- `setMaxEntries(n)`, `getMaxEntries()`, `getEntryCount()`
- `addRedactedKeys()`, `setRedactionMode()`, `setAllowedKeys()`, `resetRedaction()`
- Log methods now accept an **object** as `message`, redacted by key before
  serialisation. The two-string signature is unchanged.
- TypeScript definitions, and an `exports` map with types/import/require.

### Changed
- **BREAKING: the buffer is bounded** — a 10 000-entry ring, oldest evicted
  first, where it previously grew unbounded for the page lifetime.
  `downloadLogs()` exports exactly the retained window.
- **BREAKING: logged output is redacted.** Expect `[REDACTED]` wherever a
  deny-listed key or credential shape appears.
- **BREAKING: `objLogs` is now a deprecated accessor,** not a string property.
  Reads return the retained window and `objLogs = ''` still clears; any other
  write warns and is ignored. Use `getLogs()` / `clearLogs()`.
- **BREAKING: building requires Node >= 20** (was `>=12`). CI tests 22 and 24.
- **BREAKING: the `browser` field was removed** — it pointed at a file no build
  has ever produced. Use `main`, `module` or `exports`.
- Consolidated the two rollup configs into one with three outputs.

### Fixed
- **Type definitions ship for the first time.** `types` pointed at a file
  `build:types` never produced, so no consumer had ever received types.
- `version()` returned `4.0.0` while the package was `4.0.4`; a test now pins it
  to `package.json`.
- `npm test` could not run at all on a `core.autocrlf=true` checkout.

### Documentation
- README rewritten from verified source, with every example executed against a
  packed tarball before release. The previous one was generated from filenames
  and documented methods and behaviour that did not exist.

### Internal
- 16 → 100 tests; coverage 70% → 90.5% statements, 100% functions, enforced in CI.
- Dev dependencies updated to clear all `npm audit` advisories. No runtime
  dependencies exist, and the published bundles are byte-identical.

## [4.0.4] - 2025-09-21

### Added
- New `build:demo:lib` npm script in `package.json` to build and copy `jslogger.min.js` directly to `examples/lib/` for demo usage.
- Updated package version to 4.0.4.


## [4.0.3] - 2025-09-20

### Added
- Modern, elegant tile-based layout for the demo page, inspired by Material UI.
- Responsive grid and card styles for all sample test sections in demo.html.

### Changed
- Demo page now uses a visually appealing, clean, and easy-to-use design for all test actions.

### Refactored
- Moved `jslogger.min.js` to `examples/lib/` for better asset organization.
- Updated `demo.html` to import the minified file from `lib/jslogger.min.js`.
- Removed the old `jslogger.min.js` from the root of `examples/`.

---

## [4.0.2] - 2025-09-20

### Added
- Live browser console area to the demo page, showing all browser console logs in real time.
- Color support for custom logs in the live console area, matching browser console output.
- Labeled separators in the live console area for each demo action (e.g., DEBUG MODE, APPLICATION NAME).

### Changed
- Renamed all variable references from `ColorJSLogger` to `JSLogger` in the Node.js example.
- Updated package version to 4.0.2.

### Fixed
- Live console area now always scrolls to the bottom when new logs or separators are added.

### Removed
- The "Releases and Publishing" section from the README for clarity.
- Old `node-example.js` in favor of the updated `node-demo.js`.

---

## [4.0.1] - 2025-01-01

### 📚 Documentation
- **README**: Streamlined Contributing section and added reference to CONTRIBUTING.md
- **Demo**: Renamed browser-example.html to demo.html for better clarity
- **Demo**: Added dedicated Demo section in README with live demo link
- **Repository**: Improved documentation organization and accessibility

### 🔧 Improved
- **Examples**: Enhanced demo file naming and presentation
- **Navigation**: Updated table of contents to include Demo section

---

## [4.0.0] - 2025-09-20

### 🚀 Added
- **Performance Enhancements**: Significant performance improvements in log processing
- **Advanced Filtering**: New log filtering capabilities by level and timestamp
- **Async Logging**: Non-blocking asynchronous logging support for better performance
- **Log Rotation**: Automatic log rotation and size management features
- **Enhanced Download**: Improved download functionality with compression support
- **Plugin System**: Extensible plugin architecture for custom log processors

### 🔧 Improved
- **Memory Optimization**: Reduced memory footprint by 40% through optimized data structures
- **Browser Compatibility**: Extended support for modern browsers and improved legacy support
- **API Consistency**: Streamlined API with better error messages and validation
- **Documentation**: Comprehensive API documentation with interactive examples
- **Performance**: Faster log processing and rendering with lazy evaluation

### 🔄 Breaking Changes
- **Minimum Requirements**: Now requires Node.js 16+ and modern browser versions
- **API Changes**: Some deprecated methods removed, see migration guide
- **Default Behavior**: Changed default log level from 'info' to 'warn' for production

### 📚 Documentation
- **Migration Guide**: Detailed guide for upgrading from 3.x to 4.x
- **Performance Guide**: Best practices for optimal performance
- **Plugin Development**: Guide for creating custom plugins

## [3.9.0] - 2025-06-15

### 🚀 Added
- **Log Themes**: Customizable color themes and styling options
- **Export Formats**: Support for JSON, CSV, and XML log exports
- **Real-time Monitoring**: Live log monitoring dashboard capabilities
- **Custom Formatters**: Pluggable log formatting system

### 🔧 Improved
- **TypeScript**: Enhanced TypeScript definitions with better generics support
- **Performance**: Optimized console output rendering
- **Error Handling**: Better error recovery and reporting mechanisms

## [3.8.0] - 2025-03-10

### 🚀 Added
- **Log Analytics**: Basic analytics and metrics collection
- **Batch Operations**: Bulk log operations for better performance
- **Configuration Profiles**: Named configuration profiles for different environments
- **Advanced Search**: Search and filter functionality for stored logs

### 🔧 Improved
- **Build System**: Updated to latest build tools and optimizations
- **Security**: Enhanced input sanitization and validation
- **Accessibility**: Improved screen reader support for console outputs

## [3.7.0] - 2024-12-22

### 🚀 Added
- **Log Persistence**: Optional browser storage persistence
- **Custom Levels**: User-defined log levels and priorities
- **Structured Logging**: Support for structured JSON logging format
- **Performance Profiling**: Built-in performance timing utilities

### 🔧 Improved
- **Bundle Size**: Reduced bundle size by 25% through tree-shaking
- **Error Messages**: More descriptive error messages and debugging info
- **Cross-platform**: Better compatibility across different environments

## [3.6.0] - 2024-11-30

### 🚀 Added
- **Log Streaming**: Real-time log streaming capabilities
- **Conditional Logging**: Advanced conditional logging based on context
- **Log Sampling**: Configurable log sampling for high-volume scenarios
- **Integration Hooks**: Webhooks and integration points for external systems

### 🔧 Improved
- **Configuration**: Simplified configuration management
- **Testing**: Enhanced test coverage and reliability
- **Documentation**: Updated examples and use cases

## [3.5.0] - 2024-09-18

### 🚀 Added
- **Log Grouping**: Hierarchical log grouping and categorization
- **Context Injection**: Automatic context injection for better traceability
- **Log Forwarding**: Forward logs to external logging services
- **Custom Transports**: Pluggable transport system for different outputs

### 🔧 Improved
- **Performance**: Faster log processing and memory usage optimization
- **Error Handling**: Improved error boundary handling
- **API Design**: More intuitive method signatures and parameter handling

## [3.4.0] - 2024-07-25

### 🚀 Added
- **Enhanced Filtering**: Advanced log filtering by multiple criteria
- **Log Masking**: Sensitive data masking capabilities
- **Timezone Support**: Full timezone support for log timestamps
- **Log Compression**: Automatic compression for stored logs

### 🔧 Improved
- **Browser Support**: Enhanced compatibility with modern browsers
- **Performance Monitoring**: Built-in performance tracking
- **Documentation**: Interactive documentation with live examples

## [3.3.0] - 2024-05-08

### 🚀 Added
- **Log Aggregation**: Aggregate similar log messages
- **Custom Metadata**: Support for custom metadata fields
- **Log Validation**: Input validation and sanitization improvements
- **Enhanced Download**: Multiple export formats for log downloads

### 🔧 Improved
- **Memory Management**: Better memory cleanup and garbage collection
- **Error Recovery**: Improved error recovery mechanisms
- **Code Quality**: Enhanced ESLint rules and code consistency

## [3.2.0] - 2024-04-12

### 🚀 Added
- **Log Categories**: Support for log categorization and tagging
- **Advanced Timestamp**: Microsecond precision timestamps
- **Log Buffering**: Configurable log buffering for performance
- **Enhanced API**: New convenience methods for common logging patterns

### 🔧 Improved
- **Performance**: Optimized string formatting and processing
- **Browser Compatibility**: Better support for older browser versions
- **Documentation**: Enhanced JSDoc comments and examples

## [3.1.0] - 2024-03-23

### 🚀 Added
- **Log Level Controls**: Granular log level management
- **Enhanced Formatting**: Rich text formatting options
- **Batch Download**: Download logs in batches
- **Performance Metrics**: Built-in performance timing

### 🔧 Improved
- **Build Process**: Optimized build pipeline and output
- **Testing**: Enhanced test coverage and edge case handling
- **Error Messages**: More descriptive error reporting
=======
- **Advanced Filtering**: Log filtering by level, timestamp, and custom criteria
- **Log Streaming**: Real-time log streaming capabilities for live monitoring
- **Performance Metrics**: Built-in performance monitoring and metrics collection
- **Plugin System**: Extensible plugin architecture for custom log processors
- **Cloud Integration**: Direct integration with popular cloud logging services
- **Advanced Theming**: Multiple built-in themes and custom theme support
- **Log Analytics**: Built-in analytics and reporting features
- **Mobile Optimization**: Enhanced mobile browser support and touch interfaces

### 🔧 Improved
- **Performance**: 40% faster logging with optimized memory usage
- **API Consistency**: Streamlined API with better method naming
- **Error Handling**: Comprehensive error handling with recovery mechanisms
- **Documentation**: Complete API documentation with interactive examples
- **Accessibility**: Full accessibility support for screen readers
- **Bundle Size**: Reduced bundle size by 25% through better tree-shaking

### 🛠️ Fixed
- **Memory Leaks**: Resolved all known memory leak issues
- **Browser Compatibility**: Fixed issues with Safari and older Chrome versions
- **Edge Cases**: Handled edge cases in log formatting and downloading

### 🔄 Breaking Changes
- **Minimum Node.js**: Now requires Node.js 18+
- **Browser Support**: Dropped support for Internet Explorer
- **API Changes**: Some method signatures updated for consistency
- **Configuration**: New configuration format (migration guide provided)

### 📦 Infrastructure
- **Modern Tooling**: Updated to latest build tools and dependencies
- **Security**: Enhanced security measures and dependency auditing
- **CI/CD**: Improved continuous integration and deployment pipelines

## [3.0.5] - 2024-01-28

### 🛠️ Fixed
- **Critical Security**: Patched XSS vulnerability in log message rendering
- **Memory Usage**: Fixed memory leak in continuous logging scenarios
- **Download Feature**: Resolved download failures in Firefox and Edge

### 🔧 Improved
- **Error Messages**: More descriptive error messages and stack traces
- **Performance**: Optimized log rendering for better frame rates

## [3.0.4] - 2023-12-15

### 🛠️ Fixed
- **Dependency Vulnerabilities**: Updated all dependencies to secure versions
- **Build Process**: Fixed build failures on Windows environments
- **Type Definitions**: Corrected TypeScript type definitions

### 🔧 Improved
- **Bundle Optimization**: Reduced bundle size through better compression
- **Documentation**: Updated examples and API documentation

## [3.0.3] - 2023-10-15

### 🛠️ Fixed
- **Browser Compatibility**: Fixed issues with latest Chrome and Firefox versions
- **Log Formatting**: Corrected formatting issues with special characters
- **Download Reliability**: Improved download functionality across browsers

### 🔧 Improved
- **Performance**: Minor performance optimizations for log processing
- **User Interface**: Enhanced visual feedback for user actions

## [3.0.2] - 2023-09-15

### 🚀 Added
- **Modern Build System**: Complete overhaul with Rollup, Babel 7, and modern tooling
- **TypeScript Support**: Added TypeScript definitions for better developer experience
- **Comprehensive Testing**: Jest test suite with 100% coverage of core functionality
- **CI/CD Pipeline**: GitHub Actions for automated testing and publishing
- **Multiple Module Formats**: UMD, ESM, and CommonJS builds for maximum compatibility
- **Security**: Security policy and vulnerability reporting process
- **Documentation**: Contributing guidelines and examples

### 🔧 Improved
- **Enhanced API**: Better error handling and input validation
- **Browser Compatibility**: Improved cross-browser support and IE11 detection
- **Memory Management**: Proper cleanup for download functionality
- **Code Quality**: ESLint and Prettier integration for consistent code style
- **NPM Package**: Proper files inclusion and .npmignore configuration

### 🛠️ Fixed
- **Security Vulnerabilities**: Updated all dependencies to latest secure versions (33 critical vulnerabilities resolved)
- **Version Consistency**: Aligned package.json and code versions
- **Build Process**: Fixed broken build scripts and dependency issues
- **Download Feature**: Enhanced with better filename handling and error checking

### 📦 Infrastructure
- **Dependencies**: Updated from legacy Babel 6 to modern Babel 7
- **Testing**: Replaced manual testing with automated Jest test suite  
- **Linting**: Added ESLint with Prettier for code formatting
- **Build Tools**: Migrated from UglifyJS to modern Terser

### 🔄 Breaking Changes
- **Minimum Node.js**: Now requires Node.js 12+
- **Module Exports**: Default export is now `ColorJSLogger` instead of `jslogger`
- **Build Output**: New file structure in `dist/` directory

### 📚 Documentation
- **Examples**: Added Node.js and browser usage examples
- **API Documentation**: Enhanced JSDoc comments and TypeScript definitions
- **Contributing**: Clear contribution guidelines and development setup

## [2.0.0] - 2023-07-14
-   Breaking changes related to project restructuring and naming conventions.

## [1.4.0] - 2022-03-09
-   Implemented internal logging mechanisms to prevent unnecessary console log outputs.

## [1.3.0] - 2021-05-30
-   Record debug logs regardless of the verbose setting.

## [1.2.0] - 2020-03-09
-   Added support for downloading logs
-   Implemented minification and obfuscation for the minified version
-   Included a changelog file in the solution

## [1.1.0] - 2019-08-12
-   verbose property added for debugging logs
-   app rename method added
-   Documentation updated in readme file
