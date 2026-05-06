#!/usr/bin/env bash
set -euo pipefail

if [ ! -d dist ]; then
  echo "Building site into dist/..."
  npm install
  npm run build
fi

echo "Switching to gh-pages branch..."
if git show-ref --verify --quiet refs/heads/gh-pages; then
  git checkout gh-pages
else
  git checkout --orphan gh-pages
fi

echo "Cleaning old files..."
git rm -rf . >/dev/null 2>&1 || true
rm -rf ./* ./.??* 2>/dev/null || true

echo "Copying build output..."
rsync -a dist/ ./

touch .nojekyll

echo "Committing deploy..."
git add -A
if git diff --cached --quiet; then
  echo "No changes to deploy. Exiting."
else
  git commit -m "Deploy site to GitHub Pages"
fi

echo "Pushing to gh-pages branch..."
git push origin gh-pages --force

echo "Switching back to main..."
git checkout main

echo "Deployment complete."
