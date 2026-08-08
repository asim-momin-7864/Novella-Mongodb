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
  gener: generEnum('gener').array().notNull(),
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

/*
* TIP/Note: how to migrate schema if not detecting change automatically

### 2. How I altered the table
Behind the scenes, I connected to your PostgreSQL database using the command line (`psql`) and ran this exact SQL command:

```sql
ALTER TABLE books ALTER COLUMN gener TYPE gener[] USING ARRAY[gener];
```
* **`TYPE gener[]`**: Tells PostgreSQL to change the column into an array of the custom `gener` enum.
* **`USING ARRAY[gener]`**: Tells PostgreSQL how to handle existing data. It takes the old single string and wraps it in an array so no data is lost.

### 3. How to make these database changes from code (Migrations)
Normally, when you change a type in `schema.ts`, you run `npm run db:generate` and Drizzle automatically writes the SQL for you.

However, **Drizzle-kit currently has a bug/limitation:** it fails to automatically detect when you change a custom enum to an array of that enum. That's why it said *"No changes detected"* when you ran it earlier. 

When Drizzle fails to detect a change, you can do it manually in code using a **Custom Migration**:

1. Run this command to create a blank migration file:
   ```bash
   npx drizzle-kit generate --custom
   ```
2. Open the new `.sql` file it created in your `drizzle` folder.
3. Paste the raw SQL query inside it (like the `ALTER TABLE` command above).
4. Run your migration command (`npm run db:migrate`) to apply it to the database! 

This is the standard, professional way to handle complex database schema changes that ORMs can't figure out automatically.
*/
