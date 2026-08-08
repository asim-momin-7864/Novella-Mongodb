//* relations
import { defineRelations } from 'drizzle-orm';
import * as schema from './schema.js';

export const relations = defineRelations(schema, (r) => ({
  // users side relation
  usersTable: {
    booksTable: r.many.booksTable(),
  },

  // books side ralations
  booksTable: {
    usersTable: r.one.usersTable({
      from: r.booksTable.ownerId,
      to: r.usersTable.id,
    }),
  },
}));
