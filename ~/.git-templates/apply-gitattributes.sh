#!/bin/bash
# Script to apply .gitattributes to existing Git repositories

GITATTRIBUTES_TEMPLATE="$HOME/.git-templates/gitattributes"

if [ ! -f "$GITATTRIBUTES_TEMPLATE" ]; then
    echo "Error: Template file not found at $GITATTRIBUTES_TEMPLATE"
    exit 1
fi

if [ ! -d ".git" ]; then
    echo "Error: Not a Git repository. Run this script from the root of a Git repo."
    exit 1
fi

# Copy template to current repo
cp "$GITATTRIBUTES_TEMPLATE" .gitattributes
echo "✓ Created .gitattributes file"

# Normalize line endings
echo "Normalizing line endings..."
git add --renormalize .
echo "✓ Line endings normalized"

echo ""
echo "Done! You can now commit the changes:"
echo "  git commit -m 'Add .gitattributes and normalize line endings'"

