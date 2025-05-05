import { db } from "@db";
import { flashcards, tags, flashcardTags, FlashcardInsert, TagInsert, FlashcardTagInsert, Tag, Flashcard } from "@shared/schema";
import { eq, and, ilike, desc, inArray } from "drizzle-orm";

export const storage = {
  // Flashcard operations
  async getAllFlashcards() {
    const result = await db.query.flashcards.findMany({
      orderBy: desc(flashcards.created_at),
      with: {
        tags: {
          with: {
            tag: true
          }
        }
      }
    });

    // Transform the data to flatten the tag structure
    return result.map(card => ({
      ...card,
      tags: card.tags.map(tag => tag.tag)
    }));
  },

  async getFlashcardById(id: number) {
    const result = await db.query.flashcards.findFirst({
      where: eq(flashcards.id, id),
      with: {
        tags: {
          with: {
            tag: true
          }
        }
      }
    });

    if (!result) return null;

    // Transform the data to flatten the tag structure
    return {
      ...result,
      tags: result.tags.map(tag => tag.tag)
    };
  },

  async searchFlashcards(query: string, tagIds?: number[]) {
    let cards;

    if (tagIds && tagIds.length > 0) {
      // Find flashcards with any of the specified tags and matching search term
      const flashcardIdsWithTags = await db
        .select({ id: flashcardTags.flashcard_id })
        .from(flashcardTags)
        .where(inArray(flashcardTags.tag_id, tagIds));
      
      const flashcardIds = flashcardIdsWithTags.map(item => item.id);
      
      if (flashcardIds.length === 0) {
        return [];
      }

      cards = await db.query.flashcards.findMany({
        where: and(
          inArray(flashcards.id, flashcardIds),
          query ? 
            and(
              ilike(flashcards.front, `%${query}%`),
              ilike(flashcards.back, `%${query}%`)
            ) : undefined
        ),
        orderBy: desc(flashcards.created_at),
        with: {
          tags: {
            with: {
              tag: true
            }
          }
        }
      });
    } else {
      // Search only by query
      cards = await db.query.flashcards.findMany({
        where: query ? 
          or(
            ilike(flashcards.front, `%${query}%`),
            ilike(flashcards.back, `%${query}%`)
          ) : undefined,
        orderBy: desc(flashcards.created_at),
        with: {
          tags: {
            with: {
              tag: true
            }
          }
        }
      });
    }

    // Transform the data to flatten the tag structure
    return cards.map(card => ({
      ...card,
      tags: card.tags.map(tag => tag.tag)
    }));
  },

  async createFlashcard(data: FlashcardInsert, tagIds: number[] = []) {
    const [newCard] = await db.insert(flashcards).values(data).returning();

    // If there are tags, associate them with the flashcard
    if (tagIds.length > 0) {
      const tagRelations = tagIds.map(tagId => ({
        flashcard_id: newCard.id,
        tag_id: tagId
      }));

      await db.insert(flashcardTags).values(tagRelations);
    }

    // Get the complete flashcard with tags
    return this.getFlashcardById(newCard.id);
  },

  async updateFlashcard(id: number, data: Partial<FlashcardInsert>, tagIds?: number[]) {
    // Update flashcard data
    const [updatedCard] = await db
      .update(flashcards)
      .set({ ...data, updated_at: new Date() })
      .where(eq(flashcards.id, id))
      .returning();

    // If tag IDs were provided, update the card's tags
    if (tagIds !== undefined) {
      // Delete existing tag associations
      await db
        .delete(flashcardTags)
        .where(eq(flashcardTags.flashcard_id, id));

      // Create new tag associations
      if (tagIds.length > 0) {
        const tagRelations = tagIds.map(tagId => ({
          flashcard_id: id,
          tag_id: tagId
        }));

        await db.insert(flashcardTags).values(tagRelations);
      }
    }

    // Get the complete updated flashcard with tags
    return this.getFlashcardById(id);
  },

  async deleteFlashcard(id: number) {
    // Delete the flashcard (cascade will delete tag associations)
    const [deletedCard] = await db.delete(flashcards).where(eq(flashcards.id, id)).returning();
    return deletedCard;
  },

  async deleteAllFlashcards() {
    // Delete all flashcards (cascade will delete all tag associations)
    return await db.delete(flashcards).returning();
  },

  // Tag operations
  async getAllTags() {
    return await db.query.tags.findMany();
  },

  async getTagById(id: number) {
    return await db.query.tags.findFirst({
      where: eq(tags.id, id)
    });
  },

  async createTag(data: TagInsert) {
    const [newTag] = await db.insert(tags).values(data).returning();
    return newTag;
  },

  async updateTag(id: number, data: Partial<TagInsert>) {
    const [updatedTag] = await db
      .update(tags)
      .set(data)
      .where(eq(tags.id, id))
      .returning();
    return updatedTag;
  },

  async deleteTag(id: number) {
    const [deletedTag] = await db.delete(tags).where(eq(tags.id, id)).returning();
    return deletedTag;
  }
};

// Helper function for SQL OR operation
function or(...conditions: any[]) {
  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  
  let result = conditions[0];
  for (let i = 1; i < conditions.length; i++) {
    if (conditions[i]) {
      result = result || conditions[i];
    }
  }
  return result;
}
