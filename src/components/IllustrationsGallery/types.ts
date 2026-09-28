/**
 * Type definitions for the Illustrations Gallery
 * Aligned with va_artworks table structure and design spec
 */

export interface Artwork {
  id: string;
  seq: number;
  title: string;
  story?: string;
  medium?: string;
  chapter_id: string;
  collection_id?: string;
  image_url: string;
  featured?: boolean;
  is_draft?: boolean;
  created_at?: string;
}

export interface Section {
  id: string;
  number: number;
  name: string;
  seq_start: number;
  seq_end: number;
  artworks: Artwork[];
}

export interface Subcategory {
  id: string;
  name: string;
  chapter_id: string;
  umbrella: "fashion" | "lifestyle";
  count: number;
}

export interface Category {
  id: "fashion" | "lifestyle";
  label: string;
  color: string;
  subcategories: Subcategory[];
  count: number;
}

export type SortOrder = "seq" | "title" | "date";
