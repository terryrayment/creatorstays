import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role?: 'HOST' | 'CREATOR' | 'ADMIN';
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role?: 'HOST' | 'CREATOR' | 'ADMIN';
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: 'HOST' | 'CREATOR' | 'ADMIN';
  }
}
