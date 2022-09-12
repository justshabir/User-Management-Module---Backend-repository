import { Express } from 'express-serve-static-core';

interface User {
  id?: string;
  name: {
    firstName: string;
    lastName: string;
  };
  isAdmin?: boolean;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}
