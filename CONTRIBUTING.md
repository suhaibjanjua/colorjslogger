# Contributing to ColorJSLogger

Thank you for your interest in contributing to ColorJSLogger! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to maintain a respectful, inclusive, and professional environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 12+ and npm
- Git
- A modern code editor (VS Code recommended)

### Development Setup

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/your-username/colorjslogger.git
   cd colorjslogger
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Run tests:
   ```bash
   npm test
   ```

## Development Workflow

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our coding standards
3. Add or update tests as needed
4. Ensure all tests pass:
   ```bash
   npm test
   ```

5. Format your code:
   ```bash
   npm run format
   ```

6. Commit your changes with a descriptive message:
   ```bash
   git commit -m "feat: add new logging feature"
   ```

### Commit Message Convention

We follow conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `test:` for test changes
- `refactor:` for code refactoring
- `chore:` for maintenance tasks

### Code Standards

- Follow ESLint and Prettier configurations
- Write clear, self-documenting code
- Add JSDoc comments for public methods
- Maintain backward compatibility when possible
- Write tests for new functionality

## Testing

- Unit tests use Jest
- Run `npm test` to execute all tests
- Add tests for new features and bug fixes
- Aim for high test coverage

## Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure all tests pass and linting is clean
4. Update CHANGELOG.md following the existing format
5. Submit a pull request with:
   - Clear description of changes
   - Link to any related issues
   - Screenshots for UI changes (if applicable)

## Issue Reporting

When reporting issues:
- Use the issue template if available
- Provide clear reproduction steps
- Include browser/environment information
- Add relevant code samples or error messages

## Feature Requests

- Check existing issues first
- Describe the use case clearly
- Explain why the feature would be valuable
- Consider proposing an implementation approach

## Release Process

Releases are handled by maintainers:
1. Version bump following semantic versioning
2. Update CHANGELOG.md
3. Create release notes
4. Publish to npm

## Questions?

If you have questions about contributing:
- Check existing issues and discussions
- Create a new issue with the "question" label
- Contact the maintainers

Thank you for contributing to ColorJSLogger!