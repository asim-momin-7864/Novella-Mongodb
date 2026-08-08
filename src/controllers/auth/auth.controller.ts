import { Request, Response, NextFunction } from 'express';
import { AppError } from '#errors/AppError.js';
import { generateTokenAndSetCookie } from '#utils/auth.utils.js';
import { usersTable } from '#db/schema.js';
import { createUserDto, loginUserDto } from '#dtos/auth.dto.js';
import { db } from '#db/index.js';
import bcrypt from 'bcryptjs';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1) Validate request body against Zod schema
    const validatedData = createUserDto.parse(req.body);

    // 2) Check if user already exists
    const existingUser = await db.query.usersTable.findFirst({
      where: {
        email: validatedData.email,
      },
    });

    if (existingUser) {
      return next(new AppError('User with that email or username already exists', 409));
    }

    // hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    // 3) Create user
    const newUserArray = await db
      .insert(usersTable)
      .values({
        ...validatedData,
        password: hashedPassword,
      })
      .returning();

    // one check
    if (newUserArray.length < 1) {
      throw new AppError('Internal server error', 500);
    }

    // 4) Generate token and set cookie
    generateTokenAndSetCookie(newUserArray[0]!.id, res);

    // 5) Send response
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          _id: newUserArray[0]!.id,
          name: newUserArray[0]!.name,
          email: newUserArray[0]!.email,
        },
      },
    });
  } catch (error: unknown) {
    next(error); // This will pass ZodErrors and other errors to the global error handler
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1) Validate request body
    const validatedData = loginUserDto.parse(req.body);

    // 2) Find user by email and explicitly select the password field
    const user = await db.query.usersTable.findFirst({
      where: {
        email: validatedData.email,
      },
    });

    // 3) Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(validatedData.password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // 4) Generate token and set cookie
    generateTokenAndSetCookie(user.id, res);

    // 5) Send response
    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      data: {
        user: {
          _id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error: unknown) {
    next(error);
  }
};

export const logout = (_req: Request, res: Response, next: NextFunction): void => {
  try {
    // Clear the cookie by setting maxAge to 0 or an immediate expiration
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0), // expire immediately
    });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error: unknown) {
    next(error);
  }
};
