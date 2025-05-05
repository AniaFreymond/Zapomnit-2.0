// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// db/index.ts
import { createClient } from "@supabase/supabase-js";
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_KEY;
var supabase = createClient(supabaseUrl, supabaseKey);

// server/storage.ts
var storage = {
  // Flashcard operations
  async getAllFlashcards() {
    const { data: flashcards2, error } = await supabase.from("flashcards").select(`
        *,
        tags: flashcard_tags (
          tag: tags (*)
        )
      `).order("created_at", { ascending: false });
    if (error) throw error;
    return flashcards2.map((card) => ({
      ...card,
      tags: card.tags.map((t) => t.tag)
    }));
  },
  async getFlashcardById(id) {
    const { data, error } = await supabase.from("flashcards").select(`
        *,
        tags: flashcard_tags (
          tag: tags (*)
        )
      `).eq("id", id).single();
    if (error) throw error;
    if (!data) return null;
    return {
      ...data,
      tags: data.tags.map((t) => t.tag)
    };
  },
  async searchFlashcards(query, tagIds) {
    let supabaseQuery = supabase.from("flashcards").select(`
        *,
        tags: flashcard_tags (
          tag: tags (*)
        )
      `);
    if (query) {
      supabaseQuery = supabaseQuery.or(`front.ilike.%${query}%,back.ilike.%${query}%`);
    }
    if (tagIds && tagIds.length > 0) {
      const { data: flashcardIds } = await supabase.from("flashcard_tags").select("flashcard_id").in("tag_id", tagIds);
      if (flashcardIds && flashcardIds.length > 0) {
        supabaseQuery = supabaseQuery.in("id", flashcardIds.map((f) => f.flashcard_id));
      }
    }
    const { data: cards, error } = await supabaseQuery.order("created_at", { ascending: false });
    if (error) throw error;
    return cards.map((card) => ({
      ...card,
      tags: card.tags.map((t) => t.tag)
    }));
  },
  async createFlashcard(data, tagIds = []) {
    const { data: newCard, error } = await supabase.from("flashcards").insert(data).select().single();
    if (error) throw error;
    if (tagIds.length > 0) {
      const tagRelations = tagIds.map((tagId) => ({
        flashcard_id: newCard.id,
        tag_id: tagId
      }));
      const { error: tagError } = await supabase.from("flashcard_tags").insert(tagRelations);
      if (tagError) throw tagError;
    }
    return this.getFlashcardById(newCard.id);
  },
  async updateFlashcard(id, data, tagIds) {
    const { error } = await supabase.from("flashcards").update({ ...data, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id);
    if (error) throw error;
    if (tagIds !== void 0) {
      const { error: deleteError } = await supabase.from("flashcard_tags").delete().eq("flashcard_id", id);
      if (deleteError) throw deleteError;
      if (tagIds.length > 0) {
        const tagRelations = tagIds.map((tagId) => ({
          flashcard_id: id,
          tag_id: tagId
        }));
        const { error: insertError } = await supabase.from("flashcard_tags").insert(tagRelations);
        if (insertError) throw insertError;
      }
    }
    return this.getFlashcardById(id);
  },
  async deleteFlashcard(id) {
    const { data, error } = await supabase.from("flashcards").delete().eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  async deleteAllFlashcards() {
    const { data, error } = await supabase.from("flashcards").delete().select();
    if (error) throw error;
    return data;
  },
  // Tag operations
  async getAllTags() {
    const { data, error } = await supabase.from("tags").select("*");
    if (error) throw error;
    return data;
  },
  async getTagById(id) {
    const { data, error } = await supabase.from("tags").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  },
  async createTag(data) {
    const { data: newTag, error } = await supabase.from("tags").insert(data).select().single();
    if (error) throw error;
    return newTag;
  },
  async updateTag(id, data) {
    const { data: updatedTag, error } = await supabase.from("tags").update(data).eq("id", id).select().single();
    if (error) throw error;
    return updatedTag;
  },
  async deleteTag(id) {
    const { data, error } = await supabase.from("tags").delete().eq("id", id).select().single();
    if (error) throw error;
    return data;
  }
};

// shared/schema.ts
import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
var flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  front: text("front").notNull(),
  back: text("back").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull()
});
var tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull()
});
var flashcardTags = pgTable("flashcard_tags", {
  id: serial("id").primaryKey(),
  flashcard_id: integer("flashcard_id").references(() => flashcards.id, { onDelete: "cascade" }).notNull(),
  tag_id: integer("tag_id").references(() => tags.id, { onDelete: "cascade" }).notNull()
});
var flashcardsRelations = relations(flashcards, ({ many }) => ({
  tags: many(flashcardTags)
}));
var tagsRelations = relations(tags, ({ many }) => ({
  flashcards: many(flashcardTags)
}));
var flashcardTagsRelations = relations(flashcardTags, ({ one }) => ({
  flashcard: one(flashcards, {
    fields: [flashcardTags.flashcard_id],
    references: [flashcards.id]
  }),
  tag: one(tags, {
    fields: [flashcardTags.tag_id],
    references: [tags.id]
  })
}));
var flashcardInsertSchema = createInsertSchema(flashcards, {
  front: (schema) => schema.min(1, "Front side cannot be empty"),
  back: (schema) => schema.min(1, "Back side cannot be empty")
});
var tagInsertSchema = createInsertSchema(tags, {
  name: (schema) => schema.min(1, "Tag name cannot be empty"),
  color: (schema) => schema.min(1, "Tag color cannot be empty")
});
var flashcardTagInsertSchema = createInsertSchema(flashcardTags);
var flashcardWithTagsSchema = z.object({
  id: z.number(),
  front: z.string(),
  back: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  tags: z.array(z.object({
    id: z.number(),
    name: z.string(),
    color: z.string()
  }))
});

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  const apiPrefix = "/api";
  app2.get(`${apiPrefix}/flashcards`, async (req, res) => {
    try {
      const flashcards2 = await storage.getAllFlashcards();
      return res.status(200).json(flashcards2);
    } catch (error) {
      console.error("Error getting flashcards:", error);
      return res.status(500).json({ error: "Failed to retrieve flashcards" });
    }
  });
  app2.get(`${apiPrefix}/flashcards/search`, async (req, res) => {
    try {
      const query = req.query.q || "";
      const tagIds = req.query.tags ? Array.isArray(req.query.tags) ? req.query.tags.map((tag) => parseInt(tag, 10)) : [parseInt(req.query.tags, 10)] : void 0;
      const flashcards2 = await storage.searchFlashcards(query, tagIds);
      return res.status(200).json(flashcards2);
    } catch (error) {
      console.error("Error searching flashcards:", error);
      return res.status(500).json({ error: "Failed to search flashcards" });
    }
  });
  app2.get(`${apiPrefix}/flashcards/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const flashcard = await storage.getFlashcardById(id);
      if (!flashcard) {
        return res.status(404).json({ error: "Flashcard not found" });
      }
      return res.status(200).json(flashcard);
    } catch (error) {
      console.error(`Error getting flashcard ${req.params.id}:`, error);
      return res.status(500).json({ error: "Failed to retrieve flashcard" });
    }
  });
  app2.post(`${apiPrefix}/flashcards`, async (req, res) => {
    try {
      const validatedData = flashcardInsertSchema.parse(req.body);
      const tagIds = req.body.tagIds || [];
      const newFlashcard = await storage.createFlashcard(validatedData, tagIds);
      return res.status(201).json(newFlashcard);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating flashcard:", error);
      return res.status(500).json({ error: "Failed to create flashcard" });
    }
  });
  app2.put(`${apiPrefix}/flashcards/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const validatedData = flashcardInsertSchema.partial().parse(req.body);
      const tagIds = req.body.tagIds;
      const updatedFlashcard = await storage.updateFlashcard(id, validatedData, tagIds);
      if (!updatedFlashcard) {
        return res.status(404).json({ error: "Flashcard not found" });
      }
      return res.status(200).json(updatedFlashcard);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error(`Error updating flashcard ${req.params.id}:`, error);
      return res.status(500).json({ error: "Failed to update flashcard" });
    }
  });
  app2.delete(`${apiPrefix}/flashcards/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deletedFlashcard = await storage.deleteFlashcard(id);
      if (!deletedFlashcard) {
        return res.status(404).json({ error: "Flashcard not found" });
      }
      return res.status(200).json(deletedFlashcard);
    } catch (error) {
      console.error(`Error deleting flashcard ${req.params.id}:`, error);
      return res.status(500).json({ error: "Failed to delete flashcard" });
    }
  });
  app2.delete(`${apiPrefix}/flashcards`, async (req, res) => {
    try {
      const deletedFlashcards = await storage.deleteAllFlashcards();
      return res.status(200).json({
        message: `Deleted ${deletedFlashcards.length} flashcards successfully`,
        count: deletedFlashcards.length
      });
    } catch (error) {
      console.error("Error deleting all flashcards:", error);
      return res.status(500).json({ error: "Failed to delete all flashcards" });
    }
  });
  app2.get(`${apiPrefix}/tags`, async (req, res) => {
    try {
      const tags2 = await storage.getAllTags();
      return res.status(200).json(tags2);
    } catch (error) {
      console.error("Error getting tags:", error);
      return res.status(500).json({ error: "Failed to retrieve tags" });
    }
  });
  app2.post(`${apiPrefix}/tags`, async (req, res) => {
    try {
      const validatedData = tagInsertSchema.parse(req.body);
      const newTag = await storage.createTag(validatedData);
      return res.status(201).json(newTag);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating tag:", error);
      return res.status(500).json({ error: "Failed to create tag" });
    }
  });
  app2.put(`${apiPrefix}/tags/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const validatedData = tagInsertSchema.partial().parse(req.body);
      const updatedTag = await storage.updateTag(id, validatedData);
      if (!updatedTag) {
        return res.status(404).json({ error: "Tag not found" });
      }
      return res.status(200).json(updatedTag);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error(`Error updating tag ${req.params.id}:`, error);
      return res.status(500).json({ error: "Failed to update tag" });
    }
  });
  app2.delete(`${apiPrefix}/tags/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deletedTag = await storage.deleteTag(id);
      if (!deletedTag) {
        return res.status(404).json({ error: "Tag not found" });
      }
      return res.status(200).json(deletedTag);
    } catch (error) {
      console.error(`Error deleting tag ${req.params.id}:`, error);
      return res.status(500).json({ error: "Failed to delete tag" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@db": path.resolve(import.meta.dirname, "db"),
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
