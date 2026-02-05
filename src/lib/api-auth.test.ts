import { authorizeApiKeyOrAdminSession } from './api-auth';

describe('authorizeApiKeyOrAdminSession', () => {
  test('authorizes via api key when bearer token is valid', async () => {
    const headers = new Headers({ authorization: 'Bearer test-key' });
    let capturedKey: string | null = null;

    const result = await authorizeApiKeyOrAdminSession(headers, {
      verifyApiKey: async (key) => {
        capturedKey = key;
        return true;
      },
      getSession: async () => null,
      isAdmin: () => false,
    });

    expect(capturedKey).toBe('test-key');
    expect(result).toEqual({ authorized: true, method: 'api_key' });
  });

  test('authorizes via admin session when api key is invalid', async () => {
    const headers = new Headers();

    const result = await authorizeApiKeyOrAdminSession(headers, {
      verifyApiKey: async () => false,
      getSession: async () => ({ user: { role: 'admin' } }),
      isAdmin: (role) => role === 'admin',
    });

    expect(result).toEqual({ authorized: true, method: 'admin_session' });
  });

  test('denies when neither api key nor admin session is valid', async () => {
    const headers = new Headers({ authorization: 'Bearer bad-key' });

    const result = await authorizeApiKeyOrAdminSession(headers, {
      verifyApiKey: async () => false,
      getSession: async () => ({ user: { role: 'user' } }),
      isAdmin: (role) => role === 'admin',
    });

    expect(result).toEqual({ authorized: false, method: null });
  });
});
