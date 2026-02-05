'use client';

import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import type { auth as serverAuth } from '@/lib/auth';

export const { signIn, signUp, useSession } = createAuthClient({
  plugins: [inferAdditionalFields<typeof serverAuth>()],
});
