# NPM Automation Setup Guide

This guide will help you set up automated NPM publishing for your ColorJSLogger package.

## 🔧 Prerequisites

1. **NPM Account**: Make sure you have an NPM account and are a maintainer of the `colorjslogger` package
2. **GitHub Repository**: Admin access to the GitHub repository
3. **GitHub CLI**: Install [GitHub CLI](https://cli.github.com/) for manual release creation

## 🚀 Quick Setup

### Step 1: Generate NPM Token

1. Log in to [npmjs.com](https://www.npmjs.com/)
2. Go to **Access Tokens** in your account settings
3. Click **Generate New Token**
4. Choose **Automation** (for CI/CD use)
5. Copy the generated token (starts with `npm_`)

### Step 2: Add GitHub Secret

1. Go to your GitHub repository: `https://github.com/suhaibjanjua/colorjslogger`
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: Paste your NPM token from Step 1
6. Click **Add secret**

### Step 3: Create Missing Releases

Run the provided setup script to create all the missing releases:

```bash
# Make sure you're in the repository directory
cd /path/to/colorjslogger

# Run the setup script
./setup-releases.sh
```

This script will:
- Create git tags for versions 3.0.3 through 4.0.0
- Create GitHub releases with detailed release notes
- Use the current commit as the target for all releases

## 🔄 How the Automation Works

The GitHub Actions workflow (`.github/workflows/ci.yml`) now includes:

### 1. Version Detection
- Automatically detects when `package.json` version changes
- Extracts the new version number

### 2. Tag Creation
- Creates a git tag with the new version
- Pushes the tag to GitHub

### 3. GitHub Release
- Creates a GitHub release with changelog information
- Includes installation instructions and links

### 4. NPM Publishing
- Publishes the package to NPM
- Only runs when version changes

## 📦 Publishing a New Version

To publish a new version, simply:

1. **Update the version** in `package.json`:
   ```bash
   npm version patch   # For bug fixes (4.0.0 → 4.0.1)
   npm version minor   # For new features (4.0.0 → 4.1.0)
   npm version major   # For breaking changes (4.0.0 → 5.0.0)
   ```

2. **Update the changelog** in `CHANGELOG.md`:
   - Add a new section for your version
   - Follow the existing format
   - Include release date

3. **Update version in source code** (`src/jslogger.js`):
   - Update the `version()` method to return the new version
   - Update copyright year if needed

4. **Commit and push** to the main branch:
   ```bash
   git add .
   git commit -m "Release version X.Y.Z"
   git push origin main
   ```

5. **Automatic process** will:
   - Detect the version change
   - Create a git tag
   - Create a GitHub release
   - Publish to NPM

## 🛠️ Manual Release (Fallback)

If the automation fails, you can manually publish:

```bash
# Build the package
npm run build

# Publish to NPM
npm publish

# Create GitHub release manually
gh release create "vX.Y.Z" \
  --title "Release vX.Y.Z" \
  --notes "Release notes here"
```

## 🔍 Verification

After setting up:

1. **Check NPM Token**: Verify the `NPM_TOKEN` secret is added to GitHub
2. **Test Workflow**: Create a test version bump to verify the workflow works
3. **Monitor Releases**: Check that releases appear on GitHub and NPM

## 📋 Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify NPM token is correct and has automation permissions
   - Check that the token is properly added to GitHub secrets

2. **Version Not Detected**
   - Ensure `package.json` version change is in the same commit
   - Check that the workflow runs on the main branch

3. **Tag Already Exists**
   - Delete existing tag: `git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z`
   - Use a different version number

4. **NPM Publish Fails**
   - Check package name availability
   - Verify you have publish permissions
   - Ensure version doesn't already exist on NPM

### Debug Commands

```bash
# Check current tags
git tag --list

# Check NPM package info
npm view colorjslogger

# Verify authentication
gh auth status
npm whoami
```

## 🎯 Best Practices

1. **Semantic Versioning**: Follow [semver.org](https://semver.org/) guidelines
2. **Changelog**: Always update the changelog with meaningful descriptions
3. **Testing**: Ensure all tests pass before releasing
4. **Documentation**: Update documentation for new features
5. **Branch Protection**: Consider requiring PR reviews for the main branch

## 📞 Support

If you encounter issues:
1. Check the [GitHub Actions logs](https://github.com/suhaibjanjua/colorjslogger/actions)
2. Verify all prerequisites are met
3. Contact the repository maintainer for access issues