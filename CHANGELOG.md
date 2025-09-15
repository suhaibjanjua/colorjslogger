# CHANGELOG of colorjslogger

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

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
