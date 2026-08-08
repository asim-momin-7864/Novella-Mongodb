import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '#config/env.config.js';
import { UserParamsInput } from '#dtos/auth.dto.js';

export const generateTokenAndSetCookie = (
  userId: string | UserParamsInput['id'],
  res: Response
): string => {
  // Generate JWT token
  const token = jwt.sign({ userId: userId.toString() }, env.JWT_SECRET as jwt.Secret, {
    expiresIn: env.JWT_EXPIRES_IN as NonNullable<jwt.SignOptions['expiresIn']>,
  });

  // Calculate 7 days in milliseconds for cookie expiration
  const maxAge = 7 * 24 * 60 * 60 * 1000;

  // Set JWT as an HTTP-only cookie
  res.cookie('jwt', token, {
    httpOnly: true, // prevents cross-site scripting (XSS) attacks
    secure: env.NODE_ENV === 'production', // limits cookie to HTTPS in production
    sameSite: 'strict', // prevents cross-site request forgery (CSRF) attacks
    maxAge,
  });

  return token;
};
