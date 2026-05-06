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

### GitHub Actions deployment

A workflow is included at `.github/workflows/deploy.yml`.

The workflow runs on pushes to `main`, builds the app, and deploys the generated `dist/` output to GitHub Pages.

### GitHub Pages settings

For the actions workflow, Pages will serve the site from the deployed artifact.
- Branch: `gh-pages` (managed automatically by the workflow)
- Folder: `/ (root)`
