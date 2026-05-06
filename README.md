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

## GitHub Pages Deployment

This project is configured for GitHub Pages using the `docs/` directory.

1. Run `npm run build`.
2. Commit and push the generated `docs/` directory to the `main` branch.
3. In your repository settings, set GitHub Pages source to `main` branch and `docs/` folder.
4. The site will be available at: `https://r-karra.github.io/ketAI/`

> Note: This repository currently includes a backend server with `/api/*` endpoints. GitHub Pages hosts only the client-side app, so the static site will not provide server-side API functionality.

