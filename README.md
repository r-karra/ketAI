<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/88d91845-56d8-4cd0-9186-df624b8d1c52

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

This project is configured to publish as a GitHub Pages project site at `https://r-karra.github.io/ketAI/`.

1. Build the static site:
   `npm install && npm run build`
2. Create a `gh-pages` branch and publish the build output manually:
   - `git checkout --orphan gh-pages`
   - `git rm -rf .`
   - copy `dist/` contents into the branch root
   - `touch .nojekyll`
   - `git add .`
   - `git commit -m "Deploy site to GitHub Pages"`
   - `git push origin gh-pages --force`
   - `git checkout main`
3. In GitHub Pages settings:
   - Source: `gh-pages` branch
   - Folder: `/ (root)`

This keeps deployment manual and uses the generated `dist/` static site output.
