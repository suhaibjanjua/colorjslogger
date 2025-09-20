#!/bin/bash

# Script to identify missing tags and releases for colorjslogger

echo "🔍 Analyzing missing tags and releases for colorjslogger..."
echo ""

# Extract versions from CHANGELOG.md
echo "📋 Versions found in CHANGELOG.md:"
CHANGELOG_VERSIONS=$(grep -oE '\[([0-9]+\.[0-9]+\.[0-9]+)\]' CHANGELOG.md | sed 's/\[\([^]]*\)\]/\1/' | sort -V -r)
echo "$CHANGELOG_VERSIONS"
echo ""

# Get existing tags
echo "🏷️ Existing git tags:"
EXISTING_TAGS=$(git tag --list | sed 's/v//' | sort -V -r)
if [ -z "$EXISTING_TAGS" ]; then
    echo "  (none)"
else
    echo "$EXISTING_TAGS"
fi
echo ""

# Find missing tags
echo "❌ Missing git tags:"
MISSING_TAGS=""
for VERSION in $CHANGELOG_VERSIONS; do
    if ! echo "$EXISTING_TAGS" | grep -q "^$VERSION$"; then
        echo "  v$VERSION"
        MISSING_TAGS="$MISSING_TAGS $VERSION"
    fi
done

if [ -z "$MISSING_TAGS" ]; then
    echo "  (none - all changelog versions have tags)"
fi
echo ""

# Count missing
MISSING_COUNT=$(echo $MISSING_TAGS | wc -w)
TOTAL_COUNT=$(echo $CHANGELOG_VERSIONS | wc -w)

echo "📊 Summary:"
echo "  Total versions in CHANGELOG: $TOTAL_COUNT"
echo "  Missing tags: $MISSING_COUNT"
echo ""

if [ $MISSING_COUNT -gt 0 ]; then
    echo "🚀 Next steps:"
    echo "  1. Use the 'Create All Missing Releases' GitHub Actions workflow"
    echo "  2. Or manually create tags and releases for missing versions"
    echo "  3. Ensure NPM_TOKEN secret is configured for publishing"
fi