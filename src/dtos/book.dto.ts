//*  book ( text values) dto

import { z } from 'zod';
import { booksTable, generEnum } from '#db/schema.js';
import { createInsertSchema, createUpdateSchema } from 'drizzle-orm/zod';

// create book dto
export const createBookDto = createInsertSchema(booksTable, {
  title: (schema) => schema.min(1, 'Title is required').trim(),
  author: (schema) => schema.min(1, 'Author name is required').trim(),
  pages: z.coerce.number().min(1, 'Pages are required'),
  gener: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .pipe(z.array(z.enum(generEnum.enumValues))),
  /*
    1. z.union: Accepts either a single string or an array of strings (prevents type errors from Multer).
    2. .transform: Intercepts the value and forces it into an array (e.g. "Fiction" -> ["Fiction"]).
    3. .pipe: Takes the newly created array and runs strict validation to ensure every item matches a valid database Enum.
  */
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
  pages: z.coerce.number().min(1, 'Pages are required'),
  gener: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .pipe(z.array(z.enum(generEnum.enumValues))),
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
