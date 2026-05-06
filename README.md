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

1. Build and deploy manually:
   - `npm install`
   - `npm run deploy`

The deploy script will:
- build the app into `dist/`
- switch to an orphan `gh-pages` branch
- copy `dist/` contents into the branch root
- create `.nojekyll`
- commit and force-push to `gh-pages`
- switch back to `main`

2. In GitHub Pages settings:
   - Source: `gh-pages` branch
   - Folder: `/ (root)`

If you want to keep the process fully manual, you can also run the same steps by hand and use `dist/` as the published output.
