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
      
      // Tables creation with Foreign Keys
      await sql`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name TEXT UNIQUE NOT NULL
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS subcategories (
          id SERIAL PRIMARY KEY,
          category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          UNIQUE(category_id, name)
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS projects (
          id SERIAL PRIMARY KEY,
          subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          image_url TEXT,
          github_url TEXT,
          paper_url TEXT,
          project_url TEXT,
          tags TEXT,
          file_number TEXT,
          data_url TEXT,
          doc_url TEXT
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
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      );
      CREATE TABLE IF NOT EXISTS subcategories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        UNIQUE(category_id, name)
      );
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT,
        github_url TEXT,
        paper_url TEXT,
        project_url TEXT,
        tags TEXT,
        file_number TEXT,
        data_url TEXT,
        doc_url TEXT
      );
    `);
    console.log("[STORAGE] SQLite ready.");
  }

  // Seed Categories if empty
  const seedCategories = async () => {
    const cats = ['Quantum AI', 'Large sequential Models', 'Android', 'Thermodynamic Computing'];
    for (const c of cats) {
      if (usePostgres) {
        await sql`INSERT INTO categories (name) VALUES (${c}) ON CONFLICT DO NOTHING`;
        const catRows = await sql`SELECT id FROM categories WHERE name = ${c}`;
        if (catRows.length > 0) {
          const cid = catRows[0].id;
          for (const sc of ['Papers', 'Projects', 'Documentation']) {
            await sql`INSERT INTO subcategories (category_id, name) VALUES (${cid}, ${sc}) ON CONFLICT DO NOTHING`;
          }
        }
      } else {
        await sqliteDb.run("INSERT OR IGNORE INTO categories (name) VALUES (?)", [c]);
        const catRow = await sqliteDb.get("SELECT id FROM categories WHERE name = ?", [c]);
        if (catRow) {
          for (const sc of ['Papers', 'Projects', 'Documentation']) {
            await sqliteDb.run("INSERT OR IGNORE INTO subcategories (category_id, name) VALUES (?, ?)", [catRow.id, sc]);
          }
        }
      }
    }
  };
  await seedCategories();

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
      let runInsert = async (subcatId: number) => {
        if (usePostgres) {
          await sql`INSERT INTO projects (title, description, image_url, github_url, paper_url, project_url, tags, subcategory_id) VALUES (${p.title}, ${p.description}, ${p.imageUrl}, ${p.githubUrl}, ${p.paperUrl}, ${p.projectUrl}, ${p.tags}, ${subcatId})`;
        } else {
          await sqliteDb.run(
            "INSERT INTO projects (title, description, image_url, github_url, paper_url, project_url, tags, subcategory_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [p.title, p.description, p.imageUrl, p.githubUrl, p.paperUrl, p.projectUrl, p.tags, subcatId]
          );
        }
      };
      
      let sid = null;
      if (usePostgres) {
        const scRows = await sql`SELECT s.id FROM subcategories s JOIN categories c ON s.category_id = c.id WHERE c.name = 'Thermodynamic Computing' AND s.name = 'Projects'`;
        if (scRows.length) sid = scRows[0].id;
      } else {
        const scRow = await sqliteDb.get(`SELECT s.id FROM subcategories s JOIN categories c ON s.category_id = c.id WHERE c.name = 'Thermodynamic Computing' AND s.name = 'Projects'`);
        if (scRow) sid = scRow.id;
      }
      if (sid) {
        await runInsert(sid);
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
        ? await sql`
            SELECT p.*, c.name as category, s.name as subcategory 
            FROM projects p 
            LEFT JOIN subcategories s ON p.subcategory_id = s.id 
            LEFT JOIN categories c ON s.category_id = c.id 
            ORDER BY p.id DESC
          `
        : await sqliteDb.all(`
            SELECT p.*, c.name as category, s.name as subcategory 
            FROM projects p 
            LEFT JOIN subcategories s ON p.subcategory_id = s.id 
            LEFT JOIN categories c ON s.category_id = c.id 
            ORDER BY p.id DESC
          `);
      
      console.log(`[API/projects] Successfully retrieved ${results.length} records`);
      res.json(results.map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        imageUrl: p.image_url || p.imageurl,
        githubUrl: p.github_url || p.githuburl,
        paperUrl: p.paper_url || p.paperurl,
        projectUrl: p.project_url || p.projecturl,
        tags: (p.tags || "").split(",").map((t: string) => t.trim()),
        category: p.category,
        subCategory: p.subcategory || p.subCategory,
        fileNumber: p.file_number || p.filenumber,
        dataUrl: p.data_url || p.dataurl,
        docUrl: p.doc_url || p.docurl
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

      const { title, description, imageUrl, githubUrl, paperUrl, projectUrl, tags, category, subCategory, fileNumber, dataUrl, docUrl } = req.body;
      const tagsStr = Array.isArray(tags) ? tags.join(",") : tags;
      const catName = category || 'Thermodynamic Computing';
      const subName = subCategory || 'Projects';

      let sid = null;
      if (usePostgres) {
        const scRows = await sql`SELECT s.id FROM subcategories s JOIN categories c ON s.category_id = c.id WHERE c.name = ${catName} AND s.name = ${subName}`;
        if (scRows.length) sid = scRows[0].id;
      } else {
        const scRow = await sqliteDb.get(`SELECT s.id FROM subcategories s JOIN categories c ON s.category_id = c.id WHERE c.name = ? AND s.name = ?`, [catName, subName]);
        if (scRow) sid = scRow.id;
      }

      if (usePostgres) {
        console.log("[API/projects] Writing to Neon...");
        const result = await sql`
          INSERT INTO projects (title, description, image_url, github_url, paper_url, project_url, tags, subcategory_id, file_number, data_url, doc_url) 
          VALUES (${title}, ${description}, ${imageUrl}, ${githubUrl}, ${paperUrl}, ${projectUrl}, ${tagsStr}, ${sid}, ${fileNumber || null}, ${dataUrl || null}, ${docUrl || null})
          RETURNING id
        `;
        console.log(`[API/projects] Success (Neon). New ID: ${result[0].id}`);
        res.status(201).json({ id: result[0].id });
      } else {
        console.log("[API/projects] Writing to SQLite...");
        const result = await sqliteDb.run(
          "INSERT INTO projects (title, description, image_url, github_url, paper_url, project_url, tags, subcategory_id, file_number, data_url, doc_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [title, description, imageUrl, githubUrl, paperUrl, projectUrl, tagsStr, sid, fileNumber || null, dataUrl || null, docUrl || null]
        );
        console.log(`[API/projects] Success (SQLite). New ID: ${result.lastID}`);
        res.status(201).json({ id: result.lastID });
      }
    } catch (error: any) {
      console.error("[API/projects] Create error:", error);
      res.status(500).json({ error: error.message || "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const authKey = req.headers["x-api-key"]?.toString().trim();
      const secret = (process.env.ADMIN_SECRET?.trim() || "eth::aei");
      
      if (authKey !== secret) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const { title, description, imageUrl, githubUrl, paperUrl, projectUrl, tags, category, subCategory, fileNumber, dataUrl, docUrl } = req.body;
      const tagsStr = Array.isArray(tags) ? tags.join(",") : tags;
      const catName = category || 'Thermodynamic Computing';
      const subName = subCategory || 'Projects';

      let sid = null;
      if (usePostgres) {
        const scRows = await sql`SELECT s.id FROM subcategories s JOIN categories c ON s.category_id = c.id WHERE c.name = ${catName} AND s.name = ${subName}`;
        if (scRows.length) sid = scRows[0].id;
      } else {
        const scRow = await sqliteDb.get(`SELECT s.id FROM subcategories s JOIN categories c ON s.category_id = c.id WHERE c.name = ? AND s.name = ?`, [catName, subName]);
        if (scRow) sid = scRow.id;
      }

      if (usePostgres) {
        await sql`
          UPDATE projects 
          SET title = ${title}, description = ${description}, image_url = ${imageUrl}, github_url = ${githubUrl}, paper_url = ${paperUrl}, project_url = ${projectUrl}, tags = ${tagsStr}, subcategory_id = ${sid}, file_number = ${fileNumber || null}, data_url = ${dataUrl || null}, doc_url = ${docUrl || null}
          WHERE id = ${id}
        `;
        res.json({ success: true });
      } else {
        await sqliteDb.run(
          "UPDATE projects SET title = ?, description = ?, image_url = ?, github_url = ?, paper_url = ?, project_url = ?, tags = ?, subcategory_id = ?, file_number = ?, data_url = ?, doc_url = ? WHERE id = ?",
          [title, description, imageUrl, githubUrl, paperUrl, projectUrl, tagsStr, sid, fileNumber || null, dataUrl || null, docUrl || null, id]
        );
        res.json({ success: true });
      }
    } catch (error: any) {
      console.error("[API/projects] Update error:", error);
      res.status(500).json({ error: error.message || "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const authKey = req.headers["x-api-key"]?.toString().trim();
      const secret = (process.env.ADMIN_SECRET?.trim() || "eth::aei");
      
      if (authKey !== secret) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;

      if (usePostgres) {
        await sql`DELETE FROM projects WHERE id = ${id}`;
      } else {
        await sqliteDb.run("DELETE FROM projects WHERE id = ?", [id]);
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error("[API/projects] Delete error:", error);
      res.status(500).json({ error: error.message || "Failed to delete project" });
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
