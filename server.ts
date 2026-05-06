import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import cors from "cors";
import { neon } from "@neondatabase/serverless";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Logging middleware
  app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
  });

  // Database setup
  const DATABASE_URL = process.env.DATABASE_URL;
  let usePostgres = !!DATABASE_URL;
  let sql: any;
  let sqliteDb: any;

  console.log(`[STORAGE] Initialization starting. Mode: ${usePostgres ? "Neon Postgres" : "Local SQLite"}`);

  if (usePostgres) {
    try {
      sql = neon(DATABASE_URL!);
      await sql`SELECT 1`; // Simple ping to verify connection
      await sql`
        CREATE TABLE IF NOT EXISTS projects (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          imageUrl TEXT,
          githubUrl TEXT,
          paperUrl TEXT,
          projectUrl TEXT,
          tags TEXT
        )
      `;
      console.log("[STORAGE] Neon Postgres connected and projects table verified.");
    } catch (err: any) {
      console.error("[STORAGE] Neon connection/initialization failed:", err.message);
      usePostgres = false; // Fallback to SQLite if Neon fails
    }
  }

  if (!usePostgres) {
    console.log("[STORAGE] Initializing SQLite locally...");
    sqliteDb = await open({
      filename: "./database.sqlite",
      driver: sqlite3.Database,
    });

    await sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        imageUrl TEXT,
        githubUrl TEXT,
        paperUrl TEXT,
        projectUrl TEXT,
        tags TEXT
      )
    `);
    console.log("[STORAGE] SQLite ready.");
  }

  // Seed data if empty
  const getCount = async () => {
    try {
      if (usePostgres) {
        const result = await sql`SELECT COUNT(*) as count FROM projects`;
        return parseInt(result[0].count);
      } else {
        const result = await sqliteDb.get("SELECT COUNT(*) as count FROM projects");
        return result.count;
      }
    } catch (e) {
      console.error("[STORAGE] Count check failed:", e);
      return 1; // Prevent seeding on error
    }
  };

  if (await getCount() === 0) {
    console.log("[STORAGE] Seeding initial projects...");
    const seedProjects = [
      {
        title: "Quantum State Vector Simulator",
        description: "Optimized simulation of noisy quantum circuits using custom tensor contraction algorithms in C++ and Python.",
        imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800",
        githubUrl: "https://github.com/r-karra",
        paperUrl: "#",
        projectUrl: "#",
        tags: "Quantum, AI"
      },
      {
        title: "Large-Scale Graph Learner",
        description: "Distributed training framework for heterogeneous graph neural networks applied to multi-terabyte datasets.",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bbdac8626ad1?auto=format&fit=crop&q=80&w=800",
        githubUrl: "https://github.com/r-karra",
        paperUrl: "#",
        projectUrl: "#",
        tags: "Deep Learning, Systems"
      },
      {
        title: "Neural-Symbolic Reasoning",
        description: "Exploring the intersection of logic-based reasoning and deep learning to create more interpretable AI models.",
        imageUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=800",
        githubUrl: "https://github.com/r-karra",
        paperUrl: "#",
        projectUrl: "#",
        tags: "Research, Ethics"
      }
    ];

    for (const p of seedProjects) {
      if (usePostgres) {
        await sql`INSERT INTO projects (title, description, imageUrl, githubUrl, paperUrl, projectUrl, tags) VALUES (${p.title}, ${p.description}, ${p.imageUrl}, ${p.githubUrl}, ${p.paperUrl}, ${p.projectUrl}, ${p.tags})`;
      } else {
        await sqliteDb.run(
          "INSERT INTO projects (title, description, imageUrl, githubUrl, paperUrl, projectUrl, tags) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [p.title, p.description, p.imageUrl, p.githubUrl, p.paperUrl, p.projectUrl, p.tags]
        );
      }
    }
    console.log("[STORAGE] Seeding complete.");
  }

  // API Routes
  app.get("/api/test-db", async (req, res) => {
    try {
      console.log("[API/test-db] Request received");
      if (usePostgres) {
        const result = await sql`SELECT NOW()`;
        return res.json({ status: "ok", mode: "postgres", result });
      } else {
        const result = await sqliteDb.get("SELECT 1+1 as result");
        return res.json({ status: "ok", mode: "sqlite", result });
      }
    } catch (error: any) {
      console.error("[API/test-db] Error:", error);
      return res.status(500).json({ status: "error", error: error.message });
    }
  });

  app.get("/api/projects", async (req, res) => {
    try {
      console.log(`[API/projects] GET fetching (mode: ${usePostgres ? "postgres" : "sqlite"})`);
      const results = usePostgres 
        ? await sql`SELECT * FROM projects ORDER BY id DESC`
        : await sqliteDb.all("SELECT * FROM projects ORDER BY id DESC");
      
      console.log(`[API/projects] Successfully retrieved ${results.length} records`);
      res.json(results.map((p: any) => ({
        ...p,
        tags: p.tags ? p.tags.split(",").map((t: string) => t.trim()) : []
      })));
    } catch (error: any) {
      console.error("[API/projects] Fetch error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const authKey = req.headers["x-api-key"]?.toString().trim();
      const secret = (process.env.ADMIN_SECRET?.trim() || "eth::aei");
      
      console.log(`[API/projects] POST attempt. Auth provided: ${authKey ? "YES" : "NO"}`);
      
      if (authKey !== secret) {
        console.warn("[API/projects] Unauthorized access attempt: Auth key mismatch");
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { title, description, imageUrl, githubUrl, paperUrl, projectUrl, tags } = req.body;
      const tagsStr = Array.isArray(tags) ? tags.join(",") : tags;
      
      if (usePostgres) {
        console.log("[API/projects] Writing to Neon...");
        const result = await sql`
          INSERT INTO projects (title, description, imageUrl, githubUrl, paperUrl, projectUrl, tags) 
          VALUES (${title}, ${description}, ${imageUrl}, ${githubUrl}, ${paperUrl}, ${projectUrl}, ${tagsStr})
          RETURNING id
        `;
        console.log(`[API/projects] Success (Neon). New ID: ${result[0].id}`);
        res.status(201).json({ id: result[0].id });
      } else {
        console.log("[API/projects] Writing to SQLite...");
        const result = await sqliteDb.run(
          "INSERT INTO projects (title, description, imageUrl, githubUrl, paperUrl, projectUrl, tags) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [title, description, imageUrl, githubUrl, paperUrl, projectUrl, tagsStr]
        );
        console.log(`[API/projects] Success (SQLite). New ID: ${result.lastID}`);
        res.status(201).json({ id: result.lastID });
      }
    } catch (error: any) {
      console.error("[API/projects] Create error:", error);
      res.status(500).json({ error: error.message || "Failed to create project" });
    }
  });

  // Fallback for missing API routes to ensure they ALWAYS return JSON
  app.use("/api/*", (req, res) => {
    console.warn(`[SERVER] 404 API Route: ${req.url}`);
    res.status(404).json({ error: `API route not found: ${req.originalUrl}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("[SERVER] Initializing Vite middleware...");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[SERVER] Vite middleware attached.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Critical error starting server:", error);
  process.exit(1);
});
