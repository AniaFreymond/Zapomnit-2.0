import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Flashcards table
export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  front: text("front").notNull(),
  back: text("back").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull()
});

// Tags table
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull()
});

// Flashcard-Tag relationship table
export const flashcardTags = pgTable("flashcard_tags", {
  id: serial("id").primaryKey(),
  flashcard_id: integer("flashcard_id").references(() => flashcards.id, { onDelete: "cascade" }).notNull(),
  tag_id: integer("tag_id").references(() => tags.id, { onDelete: "cascade" }).notNull()
});

// Relations
export const flashcardsRelations = relations(flashcards, ({ many }) => ({
  tags: many(flashcardTags)
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  flashcards: many(flashcardTags)
}));

export const flashcardTagsRelations = relations(flashcardTags, ({ one }) => ({
  flashcard: one(flashcards, {
    fields: [flashcardTags.flashcard_id],
    references: [flashcards.id]
  }),
  tag: one(tags, {
    fields: [flashcardTags.tag_id],
    references: [tags.id]
  })
}));

// Schemas for validation
export const flashcardInsertSchema = createInsertSchema(flashcards, {
  front: (schema) => schema.min(1, "Front side cannot be empty"),
  back: (schema) => schema.min(1, "Back side cannot be empty")
});

export const tagInsertSchema = createInsertSchema(tags, {
  name: (schema) => schema.min(1, "Tag name cannot be empty"),
  color: (schema) => schema.min(1, "Tag color cannot be empty")
});

export const flashcardTagInsertSchema = createInsertSchema(flashcardTags);

// Export types
export type Flashcard = typeof flashcards.$inferSelect;
export type FlashcardInsert = z.infer<typeof flashcardInsertSchema>;
export type Tag = typeof tags.$inferSelect;
export type TagInsert = z.infer<typeof tagInsertSchema>;
export type FlashcardTag = typeof flashcardTags.$inferSelect;
export type FlashcardTagInsert = z.infer<typeof flashcardTagInsertSchema>;

// Additional schemas for API operations
export const flashcardWithTagsSchema = z.object({
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

export type FlashcardWithTags = z.infer<typeof flashcardWithTagsSchema>;
