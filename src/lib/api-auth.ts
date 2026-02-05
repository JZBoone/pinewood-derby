import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/user';

export type HeadersLike = HeadersInit;

type Session = {
  user: {
    role: string;
  };
};

type ApiAuthDeps = {
  verifyApiKey: (key: string) => Promise<boolean>;
  getSession: (headers: HeadersLike) => Promise<Session | null>;
  isAdmin: (role: string) => boolean;
};

export type ApiAuthResult = {
  authorized: boolean;
  method: 'api_key' | 'admin_session' | null;
};

function getBearerToken(reqHeaders: HeadersLike): string | null {
  const headers = new Headers(reqHeaders);
  const authHeader = headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  return token || null;
}

const defaultDeps: ApiAuthDeps = {
  verifyApiKey: async (key) => {
    const apiKeyData = await auth.api.verifyApiKey({
      body: { key },
    });
    return apiKeyData.valid;
  },
  getSession: async (headers) =>
    auth.api.getSession({
      headers,
    }),
  isAdmin,
};

export async function authorizeApiKeyOrAdminSession(
  reqHeaders: HeadersLike,
  deps: ApiAuthDeps = defaultDeps
): Promise<ApiAuthResult> {
  const [apiKeyValid, adminSessionValid] = await Promise.all([
    validateApiKey(reqHeaders, deps),
    validateAdminSession(reqHeaders, deps),
  ]);

  if (apiKeyValid) {
    return { authorized: true, method: 'api_key' };
  }

  if (adminSessionValid) {
    return { authorized: true, method: 'admin_session' };
  }

  return { authorized: false, method: null };
}

async function validateApiKey(
  reqHeaders: HeadersLike,
  deps: ApiAuthDeps
): Promise<boolean> {
  const key = getBearerToken(reqHeaders);
  if (!key) {
    return false;
  }
  return deps.verifyApiKey(key);
}

async function validateAdminSession(
  reqHeaders: HeadersLike,
  deps: ApiAuthDeps
): Promise<boolean> {
  const session = await deps.getSession(reqHeaders);
  return !!session && deps.isAdmin(session.user.role);
}
