import { z } from 'zod';
import { usersTable } from '#db/schema.js';
import { createInsertSchema, createUpdateSchema } from 'drizzle-orm/zod';

// create/ register dto
export const createUserDto = createInsertSchema(usersTable, {
  name: (schema) => schema.min(2, 'Name must be atleast 2 character long'),
  email: () => z.email('Invalid email address'),
  password: (schema) => schema.min(6, 'Password must be atleast 6 character long'),
});

// login dto
export const loginUserDto = createUserDto.pick({
  email: true,
  password: true,
});

// update dto
export const updateUserDto = createUpdateSchema(usersTable, {
  name: (schema) => schema.min(2, 'Name must be atleast 2 character long'),
  email: () => z.email('Invalid email address'),
  password: (schema) => schema.min(6, 'Password must be atleast 6 character long'),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// user params id
export const userParamsDto = z.object({
  id: z.uuid('Invalid user ID'),
});

// TS types
export type CreateUserInput = z.infer<typeof createUserDto>;
export type LoginUserInput = z.infer<typeof loginUserDto>;
export type UpdateUserInput = z.infer<typeof updateUserDto>;
export type UserParamsInput = z.infer<typeof userParamsDto>;
