import { auth } from '@/lib/auth';

// run with npx dotenv -e .env -- npx tsx ./scripts/create-race-interface-api-key.ts

async function createApiKey() {
  const data = await auth.api.createApiKey({
    body: {
      name: '',
      expiresIn: null,
      userId: '',
      prefix: '',
    },
  });

  console.log('data', data);
}

createApiKey();
