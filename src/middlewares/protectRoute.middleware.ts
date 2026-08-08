import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '#config/env.config.js';
import { AppError } from '#errors/AppError.js';

interface DecodedToken extends jwt.JwtPayload {
  userId: string;
}

export const protectRoute = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1) Get token from cookies
    const token = req.cookies?.jwt;

    if (!token) {
      return next(new AppError('Unauthorized - No token provided', 401));
    }

    // 2) Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET as string) as DecodedToken;

    // check
    if (!decoded || !decoded.userId) {
      throw new AppError('Unauthorized - Invalid Token Payload', 401);
    }

    //! Not needed, we are alredy verifying it with JWT
    // 3) Check if user still exists
    // const currentUser = await User.findById(decoded.userId).select('-password');
    // if (!currentUser) {
    //   return next(new AppError('Unauthorized - User not found', 401));
    // }

    // 4) Grant access to protected route by attaching user ID to request
    req.user = {
      id: decoded.userId,
    };

    next();
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Unauthorized - Token expired', 401));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Unauthorized - Invalid token', 401));
    }
    next(error);
  }
};
