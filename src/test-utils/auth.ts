import { db } from '@/api-biz/db';
import { auth } from '@/lib/auth';
import { serializeSignedCookie } from 'better-call';
import { randomUUID } from 'node:crypto';

type CreateTestUserOptions = {
  role?: 'admin' | 'user';
  email?: string;
  name?: string;
};

type TestAuthResult = {
  userId: string;
  headers: Headers;
};

function randomEmail() {
  return `test-${randomUUID()}@example.test`;
}

export async function createTestUser(
  options: CreateTestUserOptions = {}
): Promise<{ id: string }> {
  const user = await db.user.create({
    data: {
      id: randomUUID(),
      name: options.name ?? 'Test User',
      email: options.email ?? randomEmail(),
      role: options.role ?? 'admin',
    },
    select: { id: true },
  });

  return user;
}

export async function createTestApiKeyAuth(
  options: CreateTestUserOptions = {}
): Promise<TestAuthResult & { apiKey: string }> {
  const user = await createTestUser(options);
  const apiKeyResult = await auth.api.createApiKey({
    body: {
      userId: user.id,
      name: 'test-key',
    },
  });

  const apiKey = apiKeyResult.key;
  const headers = new Headers({
    authorization: `Bearer ${apiKey}`,
  });

  return { userId: user.id, headers, apiKey };
}

export async function createTestSessionAuth(
  options: CreateTestUserOptions = {}
): Promise<TestAuthResult & { sessionToken: string }> {
  const user = await createTestUser(options);
  const ctx = await auth.$context;
  const session = await ctx.internalAdapter.createSession(user.id, false);
  if (!session) {
    throw new Error('Failed to create session for test user');
  }

  const cookieName = ctx.authCookies.sessionToken.name;
  const cookieOptions = ctx.authCookies.sessionToken.attributes;
  const signedCookie = await serializeSignedCookie(
    cookieName,
    session.token,
    ctx.secret,
    cookieOptions
  );
  const cookiePair = signedCookie.split(';')[0] ?? signedCookie;
  const headers = new Headers({
    cookie: cookiePair,
  });

  return { userId: user.id, headers, sessionToken: session.token };
}
