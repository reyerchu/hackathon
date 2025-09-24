# Upstream Repository Setup

This repository is a fork of [hackjunction/JunctionApp](https://github.com/hackjunction/JunctionApp) with the following setup:

## Remote Configuration

- **origin**: `https://github.com/reyerchu/hackathon.git` (your fork)
- **upstream**: `https://github.com/hackjunction/JunctionApp.git` (original repository)

## Current Status

✅ Repository remotes configured correctly  
✅ Upstream changes fetched and merged  
⚠️  **Manual step required**: Push changes to your fork

## Manual Steps Required

Due to authentication requirements, you need to manually push the changes to your fork:

```bash
# Option 1: Using HTTPS (you'll be prompted for credentials)
git remote set-url origin https://github.com/reyerchu/hackathon.git
git push origin STAG

# Option 2: Using SSH (requires SSH key setup)
git remote set-url origin git@github.com:reyerchu/hackathon.git
git push origin STAG
```

## Future Upstream Merges

Use the provided script to easily merge future changes from the original repository:

```bash
# Merge latest changes from upstream STAG branch (default)
./merge-upstream.sh

# Merge changes from a specific upstream branch
./merge-upstream.sh master
./merge-upstream.sh dev
```

## Manual Upstream Merge Process

If you prefer to do it manually:

```bash
# 1. Fetch latest changes from upstream
git fetch upstream

# 2. Merge the desired upstream branch (usually STAG)
git merge upstream/STAG

# 3. Push to your fork
git push origin STAG
```

## Branch Information

- **Default upstream branch**: `STAG`
- **Current local branch**: `STAG`
- **Available upstream branches**: All branches from the original repository are available as `upstream/branch-name`

## Troubleshooting

### Authentication Issues
- For HTTPS: Use GitHub Personal Access Token instead of password
- For SSH: Ensure your SSH key is added to your GitHub account

### Branch Conflicts
If you encounter merge conflicts:
1. Resolve conflicts manually
2. Stage resolved files: `git add <file>`
3. Complete merge: `git commit`
4. Push changes: `git push origin <branch>`

### Check Upstream Status
```bash
# See what's new in upstream
git log HEAD..upstream/STAG --oneline

# See what you have that upstream doesn't
git log upstream/STAG..HEAD --oneline
```
