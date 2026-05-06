# Portfolio App

A full-stack portfolio application with an Express backend connected to a Serverless Postgres database via Neon.tech, and a frontend built with Vite and React.

## Deployment Guide: Render.com + Neon.tech

This application is configured to be deployed as a Web Service on Render.com, connecting to a Serverless PostgreSQL database hosted on Neon.tech.

### 1. Database Setup (Neon.tech)

1. Log in or create a free account at [Neon.tech](https://neon.tech).
2. Create a new project. To minimize latency, choose the region closest to where you will deploy your app (e.g., **AWS US East 1 (N. Virginia)**).
3. Once the database is created, navigate to the **Dashboard**.
4. In the **Connection Details** section, copy the Postgres connection string (it should look like `postgresql://user:password@endpoint...`).
5. Save this string; you'll need it when configuring Render.

### 2. App Deployment (Render.com)

**Important**: Try to match your Render deployment region with your Neon database region (e.g., US East) to ensure the fastest database query performance.

1. Create a free account or log in to [Render.com](https://render.com).
2. Click **New +** and select **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect the GitHub repository containing your app's code.
4. Configure the Web Service settings:
   - **Name**: Your desired app name (e.g., `strange-works-portfolio`)
   - **Region**: Choose a region close to your Neon DB (e.g., US East / Ohio)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start` (Wait for Render to run this out of your package.json)
5. Scroll down to **Environment Variables** and add the following:
   - **Key**: `DATABASE_URL` | **Value**: `<Paste your Neon Postgres connection string here>`
   - **Key**: `ADMIN_SECRET` | **Value**: `<Your chosen secure admin password, e.g., eth::aei>`
6. Select the **Free** instance type (or a paid tier if you expect heavier traffic).
7. Click **Create Web Service**.

Render will now build your frontend assets via Vite, start your Express API server, and automatically connect to your Neon Serverless database. 

Once the deploy is marked as live, you can find the public URL of your app at the top of the Render dashboard!
