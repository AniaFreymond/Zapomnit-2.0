import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { flashcardInsertSchema, tagInsertSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiPrefix = '/api';
  
  // Get all flashcards
  app.get(`${apiPrefix}/flashcards`, async (req, res) => {
    try {
      const flashcards = await storage.getAllFlashcards();
      return res.status(200).json(flashcards);
    } catch (error) {
      console.error('Error getting flashcards:', error);
      return res.status(500).json({ error: 'Failed to retrieve flashcards' });
    }
  });

  // Search flashcards
  app.get(`${apiPrefix}/flashcards/search`, async (req, res) => {
    try {
      const query = req.query.q as string || '';
      const tagIds = req.query.tags ? 
        (Array.isArray(req.query.tags) 
          ? req.query.tags.map(tag => parseInt(tag as string, 10))
          : [parseInt(req.query.tags as string, 10)]) 
        : undefined;

      const flashcards = await storage.searchFlashcards(query, tagIds);
      return res.status(200).json(flashcards);
    } catch (error) {
      console.error('Error searching flashcards:', error);
      return res.status(500).json({ error: 'Failed to search flashcards' });
    }
  });

  // Get a specific flashcard
  app.get(`${apiPrefix}/flashcards/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const flashcard = await storage.getFlashcardById(id);
      
      if (!flashcard) {
        return res.status(404).json({ error: 'Flashcard not found' });
      }
      
      return res.status(200).json(flashcard);
    } catch (error) {
      console.error(`Error getting flashcard ${req.params.id}:`, error);
      return res.status(500).json({ error: 'Failed to retrieve flashcard' });
    }
  });

  // Create a new flashcard
  app.post(`${apiPrefix}/flashcards`, async (req, res) => {
    try {
      // Validate the flashcard data
      const validatedData = flashcardInsertSchema.parse(req.body);
      
      // Get tag IDs from request
      const tagIds = req.body.tagIds || [];
      
      // Create the flashcard with associated tags
      const newFlashcard = await storage.createFlashcard(validatedData, tagIds);
      
      return res.status(201).json(newFlashcard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating flashcard:', error);
      return res.status(500).json({ error: 'Failed to create flashcard' });
    }
  });

  // Update a flashcard
  app.put(`${apiPrefix}/flashcards/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      // Validate the flashcard data
      const validatedData = flashcardInsertSchema.partial().parse(req.body);
      
      // Get tag IDs from request
      const tagIds = req.body.tagIds;
      
      // Update the flashcard
      const updatedFlashcard = await storage.updateFlashcard(id, validatedData, tagIds);
      
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

  // Delete a flashcard
  app.delete(`${apiPrefix}/flashcards/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deletedFlashcard = await storage.deleteFlashcard(id);
      
      if (!deletedFlashcard) {
        return res.status(404).json({ error: 'Flashcard not found' });
      }
      
      return res.status(200).json(deletedFlashcard);
    } catch (error) {
      console.error(`Error deleting flashcard ${req.params.id}:`, error);
      return res.status(500).json({ error: 'Failed to delete flashcard' });
    }
  });

  // Delete all flashcards
  app.delete(`${apiPrefix}/flashcards`, async (req, res) => {
    try {
      const deletedFlashcards = await storage.deleteAllFlashcards();
      return res.status(200).json({ 
        message: `Deleted ${deletedFlashcards.length} flashcards successfully`,
        count: deletedFlashcards.length
      });
    } catch (error) {
      console.error('Error deleting all flashcards:', error);
      return res.status(500).json({ error: 'Failed to delete all flashcards' });
    }
  });

  // Get all tags
  app.get(`${apiPrefix}/tags`, async (req, res) => {
    try {
      const tags = await storage.getAllTags();
      return res.status(200).json(tags);
    } catch (error) {
      console.error('Error getting tags:', error);
      return res.status(500).json({ error: 'Failed to retrieve tags' });
    }
  });

  // Create a new tag
  app.post(`${apiPrefix}/tags`, async (req, res) => {
    try {
      // Validate the tag data
      const validatedData = tagInsertSchema.parse(req.body);
      
      // Create the tag
      const newTag = await storage.createTag(validatedData);
      
      return res.status(201).json(newTag);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating tag:', error);
      return res.status(500).json({ error: 'Failed to create tag' });
    }
  });

  // Update a tag
  app.put(`${apiPrefix}/tags/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      // Validate the tag data
      const validatedData = tagInsertSchema.partial().parse(req.body);
      
      // Update the tag
      const updatedTag = await storage.updateTag(id, validatedData);
      
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

  // Delete a tag
  app.delete(`${apiPrefix}/tags/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deletedTag = await storage.deleteTag(id);
      
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
