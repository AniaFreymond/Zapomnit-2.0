
import { supabase } from "../db";
import { FlashcardInsert, TagInsert, FlashcardWithTags } from "@shared/schema";

export const storage = {
  // Flashcard operations
  async getAllFlashcards() {
    const { data: flashcards, error } = await supabase
      .from('flashcards')
      .select(`
        *,
        tags: flashcard_tags (
          tag: tags (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return flashcards.map(card => ({
      ...card,
      tags: card.tags.map((t: any) => t.tag)
    }));
  },

  async getFlashcardById(id: number) {
    const { data, error } = await supabase
      .from('flashcards')
      .select(`
        *,
        tags: flashcard_tags (
          tag: tags (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      tags: data.tags.map((t: any) => t.tag)
    };
  },

  async searchFlashcards(query: string, tagIds?: number[]) {
    let supabaseQuery = supabase
      .from('flashcards')
      .select(`
        *,
        tags: flashcard_tags (
          tag: tags (*)
        )
      `);

    if (query) {
      supabaseQuery = supabaseQuery.or(`front.ilike.%${query}%,back.ilike.%${query}%`);
    }

    if (tagIds && tagIds.length > 0) {
      const { data: flashcardIds } = await supabase
        .from('flashcard_tags')
        .select('flashcard_id')
        .in('tag_id', tagIds);

      if (flashcardIds && flashcardIds.length > 0) {
        supabaseQuery = supabaseQuery.in('id', flashcardIds.map(f => f.flashcard_id));
      }
    }

    const { data: cards, error } = await supabaseQuery.order('created_at', { ascending: false });

    if (error) throw error;
    return cards.map(card => ({
      ...card,
      tags: card.tags.map((t: any) => t.tag)
    }));
  },

  async createFlashcard(data: FlashcardInsert, tagIds: number[] = []) {
    const { data: newCard, error } = await supabase
      .from('flashcards')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    if (tagIds.length > 0) {
      const tagRelations = tagIds.map(tagId => ({
        flashcard_id: newCard.id,
        tag_id: tagId
      }));

      const { error: tagError } = await supabase
        .from('flashcard_tags')
        .insert(tagRelations);

      if (tagError) throw tagError;
    }

    return this.getFlashcardById(newCard.id);
  },

  async updateFlashcard(id: number, data: Partial<FlashcardInsert>, tagIds?: number[]) {
    const { error } = await supabase
      .from('flashcards')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    if (tagIds !== undefined) {
      const { error: deleteError } = await supabase
        .from('flashcard_tags')
        .delete()
        .eq('flashcard_id', id);

      if (deleteError) throw deleteError;

      if (tagIds.length > 0) {
        const tagRelations = tagIds.map(tagId => ({
          flashcard_id: id,
          tag_id: tagId
        }));

        const { error: insertError } = await supabase
          .from('flashcard_tags')
          .insert(tagRelations);

        if (insertError) throw insertError;
      }
    }

    return this.getFlashcardById(id);
  },

  async deleteFlashcard(id: number) {
    const { data, error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAllFlashcards() {
    const { data, error } = await supabase
      .from('flashcards')
      .delete()
      .select();

    if (error) throw error;
    return data;
  },

  // Tag operations
  async getAllTags() {
    const { data, error } = await supabase
      .from('tags')
      .select('*');

    if (error) throw error;
    return data;
  },

  async getTagById(id: number) {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createTag(data: TagInsert) {
    const { data: newTag, error } = await supabase
      .from('tags')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return newTag;
  },

  async updateTag(id: number, data: Partial<TagInsert>) {
    const { data: updatedTag, error } = await supabase
      .from('tags')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedTag;
  },

  async deleteTag(id: number) {
    const { data, error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
