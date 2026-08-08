//*  book ( text values) dto

import { z } from 'zod';
import { booksTable } from '#db/schema.js';
import { createInsertSchema, createUpdateSchema } from 'drizzle-orm/zod';

// create book dto
export const createBookDto = createInsertSchema(booksTable, {
  title: (schema) => schema.min(1, 'Title is required').trim(),
  author: (schema) => schema.min(1, 'Author name is required').trim(),
  pages: (schema) => schema.min(1, 'Pages are required'),
}).omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
  coverPublicId: true,
  coverUrl: true,
  filePublicId: true,
  fileUrl: true,
});

// update book dto
export const updateBookDto = createUpdateSchema(booksTable, {
  title: (schema) => schema.min(1, 'Title is required').trim(),
  author: (schema) => schema.min(1, 'Author name is required').trim(),
  pages: (schema) => schema.min(1, 'Pages are required'),
}).omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
});

// params
export const bookParamsDto = z.object({
  id: z.uuid('Invalid book ID'),
});

//TS types
export type CreateBookInput = z.infer<typeof createBookDto>;
export type UpdateBookInput = z.infer<typeof updateBookDto>;
export type BookParamsInput = z.infer<typeof bookParamsDto>;
