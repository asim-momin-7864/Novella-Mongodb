// schema file
import { pgTable, uuid, text, varchar, timestamp, pgEnum, smallint } from 'drizzle-orm/pg-core';

// users schema
export const usersTable = pgTable('users', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// gener enum
export const generEnum = pgEnum('gener', [
  'Fiction',
  'Non-Fiction',
  'Mystery',
  'Thriller',
  'Science Fiction',
  'Fantasy',
  'Romance',
  'Historical Fiction',
  'Horror',
  'Biography',
  'Autobiography',
  'Memoir',
  'Self-Help',
  'Health',
  'Guide',
  'Travel',
  'Childrens',
  'Religion',
  'Spirituality',
  'Science',
  'History',
  'Math',
  'Anthology',
  'Poetry',
  'Encyclopedias',
  'Dictionaries',
  'Comics',
  'Art',
  'Cookbooks',
  'Diaries',
  'Journals',
  'Action and Adventure',
  'Graphic Novel',
]);

// books table
export const booksTable = pgTable('books', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  title: text().notNull(),
  author: text().notNull(),
  gener: generEnum('gener').notNull(),
  pages: smallint().notNull(),
  coverUrl: text('cover_url').notNull(),
  coverPublicId: text('cover_public_id').notNull(),
  fileUrl: text('file_url').notNull(),
  filePublicId: text('file_public_id').notNull(),
  ownerId: uuid('owner_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
