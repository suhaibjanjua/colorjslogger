#!/bin/bash

# Script to create the current version tag (4.0.0) locally
# This will be pushed when the workflows are committed

VERSION="4.0.0"

echo "🏷️ Creating tag for current version v$VERSION..."

# Check if tag already exists
if git rev-parse "v$VERSION" >/dev/null 2>&1; then
    echo "⚠️ Tag v$VERSION already exists locally"
    exit 0
fi

# Extract changelog content for this version
CHANGELOG_CONTENT=$(sed -n "/## \[$VERSION\]/,/## \[/p" CHANGELOG.md | sed '$ d' | tail -n +2)

if [ -z "$CHANGELOG_CONTENT" ]; then
    CHANGELOG_CONTENT="Release version $VERSION - See CHANGELOG.md for details"
fi

# Create tag
git tag -a "v$VERSION" -m "Release version $VERSION

$CHANGELOG_CONTENT"

echo "✅ Created local tag v$VERSION"
echo "📝 Tag will be pushed when you commit and push changes"
echo ""
echo "To push manually: git push origin v$VERSION"