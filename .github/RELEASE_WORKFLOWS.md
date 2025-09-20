# Release and Publishing Workflows

This repository includes several GitHub Actions workflows to manage releases and NPM publishing:

## Workflows Overview

### 1. CI/CD (`ci.yml`)
**Triggers:** Push to main/master, Pull Requests
- Runs tests on multiple Node.js versions (16.x, 18.x, 20.x)
- Automatically creates tags and releases when package.json version changes
- Publishes to NPM when new version is detected
- **Requires:** `NPM_TOKEN` secret

### 2. Create All Missing Releases (`create-missing-releases.yml`)
**Triggers:** Manual workflow dispatch
- Analyzes CHANGELOG.md to find all version entries
- Creates missing git tags and GitHub releases
- Supports dry-run mode to preview what would be created
- **Requires:** `GITHUB_TOKEN` (automatically available)

### 3. Manual Release (`release.yml`)
**Triggers:** Manual workflow dispatch
- Create tag, release, and publish for a specific version
- Flexible options to enable/disable tag creation, release creation, or NPM publishing
- **Requires:** `NPM_TOKEN` secret

### 4. Publish to NPM (`publish-npm.yml`)
**Triggers:** Manual workflow dispatch
- Publishes current version to NPM
- Checks if version already exists
- Option to force publish
- **Requires:** `NPM_TOKEN` secret

## Setup Instructions

### Required Secrets

1. **NPM_TOKEN**: Required for NPM publishing
   - Go to [npmjs.com](https://www.npmjs.com) → Account → Access Tokens
   - Create an "Automation" token
   - Add to GitHub repository secrets as `NPM_TOKEN`

2. **GITHUB_TOKEN**: Automatically provided by GitHub Actions

### Creating Missing Releases

To create all missing releases from the CHANGELOG:

1. Go to Actions tab in GitHub
2. Select "Create All Missing Releases" workflow
3. Click "Run workflow"
4. Choose `dry_run: true` first to preview what will be created
5. If satisfied, run again with `dry_run: false`

### Manual Release Process

To create a specific release:

1. Go to Actions tab in GitHub
2. Select "Release and Publish" workflow
3. Click "Run workflow"
4. Enter the version number (e.g., "4.0.0")
5. Choose options for tag creation, release creation, and NPM publishing

### Automated Releases

For future releases, simply:

1. Update the version in `package.json`
2. Add changelog entry in `CHANGELOG.md`
3. Push to main/master branch
4. The CI/CD workflow will automatically:
   - Create git tag
   - Create GitHub release
   - Publish to NPM

## Changelog Format

The workflows extract release notes from `CHANGELOG.md`. Ensure your changelog follows this format:

```markdown
## [1.2.3] - 2023-12-01

### Added
- New feature description

### Changed
- Changed feature description

### Fixed
- Bug fix description
```

## Troubleshooting

### NPM Publishing Fails
- Verify `NPM_TOKEN` secret is set correctly
- Check if version already exists on NPM
- Ensure package builds successfully

### Tag Creation Fails
- Check if tag already exists
- Verify repository permissions
- Ensure workflow has `contents: write` permission

### Release Creation Fails
- Verify `GITHUB_TOKEN` permissions
- Check if release already exists
- Ensure changelog content is properly formatted