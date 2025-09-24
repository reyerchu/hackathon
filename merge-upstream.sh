#!/bin/bash

# Script to merge latest changes from upstream JunctionApp repository
# Usage: ./merge-upstream.sh [branch-name]
# If no branch is specified, it will merge the STAG branch (default upstream branch)

set -e

# Default branch to merge
DEFAULT_BRANCH="STAG"
BRANCH_TO_MERGE=${1:-$DEFAULT_BRANCH}

echo "🔄 Merging upstream changes from hackjunction/JunctionApp..."
echo "📋 Target branch: $BRANCH_TO_MERGE"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check if upstream remote exists
if ! git remote get-url upstream > /dev/null 2>&1; then
    echo "❌ Error: Upstream remote not found. Please run:"
    echo "   git remote add upstream https://github.com/hackjunction/JunctionApp.git"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Fetch latest changes from upstream
echo "⬇️  Fetching latest changes from upstream..."
git fetch upstream

# Check if the upstream branch exists
if ! git show-ref --verify --quiet refs/remotes/upstream/$BRANCH_TO_MERGE; then
    echo "❌ Error: Upstream branch '$BRANCH_TO_MERGE' not found"
    echo "Available upstream branches:"
    git branch -r | grep upstream | sed 's/^/  /'
    exit 1
fi

# Merge the upstream branch
echo "🔀 Merging upstream/$BRANCH_TO_MERGE into $CURRENT_BRANCH..."
git merge upstream/$BRANCH_TO_MERGE

echo "✅ Successfully merged upstream changes!"
echo ""
echo "📤 To push changes to your fork, run:"
echo "   git push origin $CURRENT_BRANCH"
echo ""
echo "🔍 To see what changed, run:"
echo "   git log --oneline upstream/$BRANCH_TO_MERGE..HEAD"
