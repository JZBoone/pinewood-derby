import { auth } from '@/lib/auth';

// run with npx dotenv -e .env -- npx tsx ./scripts/create-bot-api-key.ts

async function createApiKey() {
  const data = await auth.api.createApiKey({
    body: {
      name: 'race-interface-bot',
      expiresIn: null,
      userId: '67',
      prefix: 'race-interface-bot',
    },
  });

  console.log('data', data);
}

createApiKey();
