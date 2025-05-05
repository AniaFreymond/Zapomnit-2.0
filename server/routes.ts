import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { flashcardInsertSchema, tagInsertSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiPrefix = '/api';
  
  // Auth middleware
  app.use(`${apiPrefix}/*`, (req: any, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    // Repl Auth adds user data to the request
    req.user = { id: req.headers['x-replit-user-id'] };
    next();
  });

  // Get all flashcards for the authenticated user
  app.get(`${apiPrefix}/flashcards`, async (req: any, res) => {
    try {
      const flashcards = await storage.getAllFlashcards(req.user.id);
      return res.status(200).json(flashcards);
    } catch (error) {
      console.error('Error getting flashcards:', error);
      return res.status(500).json({ error: 'Failed to retrieve flashcards' });
    }
  });

  // Search flashcards for the authenticated user
  app.get(`${apiPrefix}/flashcards/search`, async (req: any, res) => {
    try {
      const query = req.query.q as string || '';
      const tagIds = req.query.tags ? 
        (Array.isArray(req.query.tags) 
          ? req.query.tags.map(tag => parseInt(tag as string, 10))
          : [parseInt(req.query.tags as string, 10)]) 
        : undefined;

      const flashcards = await storage.searchFlashcards(query, tagIds, req.user.id);
      return res.status(200).json(flashcards);
    } catch (error) {
      console.error('Error searching flashcards:', error);
      return res.status(500).json({ error: 'Failed to search flashcards' });
    }
  });

  // Get a specific flashcard for the authenticated user
  app.get(`${apiPrefix}/flashcards/:id`, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const flashcard = await storage.getFlashcardById(id, req.user.id);

      if (!flashcard) {
        return res.status(404).json({ error: 'Flashcard not found' });
      }

      return res.status(200).json(flashcard);
    } catch (error) {
      console.error(`Error getting flashcard ${req.params.id}:`, error);
      return res.status(500).json({ error: 'Failed to retrieve flashcard' });
    }
  });

  // Create a new flashcard for the authenticated user
  app.post(`${apiPrefix}/flashcards`, async (req: any, res) => {
    try {
      // Validate the flashcard data
      const validatedData = flashcardInsertSchema.parse(req.body);

      // Get tag IDs from request
      const tagIds = req.body.tagIds || [];

      // Create the flashcard with associated tags
      const newFlashcard = await storage.createFlashcard(validatedData, tagIds, req.user.id);

      return res.status(201).json(newFlashcard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating flashcard:', error);
      return res.status(500).json({ error: 'Failed to create flashcard' });
    }
  });

  // Update a flashcard for the authenticated user
  app.put(`${apiPrefix}/flashcards/:id`, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id, 10);

      // Validate the flashcard data
      const validatedData = flashcardInsertSchema.partial().parse(req.body);

      // Get tag IDs from request
      const tagIds = req.body.tagIds;

      // Update the flashcard
      const updatedFlashcard = await storage.updateFlashcard(id, validatedData, tagIds, req.user.id);

      if (!updatedFlashcard) {
        return res.status(404).json({ error: 'Flashcard not found' });
      }

      return res.status(200).json(updatedFlashcard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error(`Error updating flashcard ${req.params.id}:`, error);
      return res.status(500).json({ error: 'Failed to update flashcard' });
    }
  });

  // Delete a flashcard for the authenticated user
  app.delete(`${apiPrefix}/flashcards/:id`, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deletedFlashcard = await storage.deleteFlashcard(id, req.user.id);

      if (!deletedFlashcard) {
        return res.status(404).json({ error: 'Flashcard not found' });
      }

      return res.status(200).json(deletedFlashcard);
    } catch (error) {
      console.error(`Error deleting flashcard ${req.params.id}:`, error);
      return res.status(500).json({ error: 'Failed to delete flashcard' });
    }
  });

  // Delete all flashcards for the authenticated user
  app.delete(`${apiPrefix}/flashcards`, async (req: any, res) => {
    try {
      const deletedFlashcards = await storage.deleteAllFlashcards(req.user.id);
      return res.status(200).json({ 
        message: `Deleted ${deletedFlashcards.length} flashcards successfully`,
        count: deletedFlashcards.length
      });
    } catch (error) {
      console.error('Error deleting all flashcards:', error);
      return res.status(500).json({ error: 'Failed to delete all flashcards' });
    }
  });

  // Get all tags for the authenticated user
  app.get(`${apiPrefix}/tags`, async (req: any, res) => {
    try {
      const tags = await storage.getAllTags(req.user.id);
      return res.status(200).json(tags);
    } catch (error) {
      console.error('Error getting tags:', error);
      return res.status(500).json({ error: 'Failed to retrieve tags' });
    }
  });

  // Create a new tag for the authenticated user
  app.post(`${apiPrefix}/tags`, async (req: any, res) => {
    try {
      // Validate the tag data
      const validatedData = tagInsertSchema.parse(req.body);

      // Create the tag
      const newTag = await storage.createTag(validatedData, req.user.id);

      return res.status(201).json(newTag);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating tag:', error);
      return res.status(500).json({ error: 'Failed to create tag' });
    }
  });

  // Update a tag for the authenticated user
  app.put(`${apiPrefix}/tags/:id`, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id, 10);

      // Validate the tag data
      const validatedData = tagInsertSchema.partial().parse(req.body);

      // Update the tag
      const updatedTag = await storage.updateTag(id, validatedData, req.user.id);

      if (!updatedTag) {
        return res.status(404).json({ error: 'Tag not found' });
      }

      return res.status(200).json(updatedTag);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error(`Error updating tag ${req.params.id}:`, error);
      return res.status(500).json({ error: 'Failed to update tag' });
    }
  });

  // Delete a tag for the authenticated user
  app.delete(`${apiPrefix}/tags/:id`, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deletedTag = await storage.deleteTag(id, req.user.id);

      if (!deletedTag) {
        return res.status(404).json({ error: 'Tag not found' });
      }

      return res.status(200).json(deletedTag);
    } catch (error) {
      console.error(`Error deleting tag ${req.params.id}:`, error);
      return res.status(500).json({ error: 'Failed to delete tag' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}