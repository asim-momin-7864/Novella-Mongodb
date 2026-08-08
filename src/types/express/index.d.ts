//* index
//* adding user object in every requests

import { Types } from 'mongoose';

// user object interface
export interface UserPayload {
  id: Types.ObjectId | string;
}

// globally mergining
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
