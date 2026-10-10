import { db } from '@/api-biz/db';
import { createTestSessionAuth } from '@/test-utils/auth';
import { derby } from '@generated/client';
import { NextRequest } from 'next/server';
import { GET } from './[version]/route';
import { PUT } from './route';

const PNG_BYTES = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3]);

function artForm(fields: Record<string, string>, image?: File) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.set(key, value);
  }
  if (image) {
    form.set('image', image);
  }
  return form;
}

async function putArt(derbyId: number, form: FormData, headers?: Headers) {
  const request = new NextRequest(`http://localhost/api/derby/${derbyId}/art`, {
    method: 'PUT',
    headers,
    body: form,
  });
  return PUT(request, { params: Promise.resolve({ id: String(derbyId) }) });
}

describe('PUT /api/derby/[id]/art', () => {
  let testDerby: derby;

  beforeEach(async () => {
    testDerby = await db.derby.create({
      data: {
        time: new Date(),
        created_at: new Date(),
        location_name: 'Test Location',
      },
    });
  });

  test('it saves the art and shortens the artist name', async () => {
    const { headers } = await createTestSessionAuth();
    const image = new File([PNG_BYTES], 'car.png', { type: 'image/png' });
    const form = artForm(
      {
        title: 'Lightning Wagon',
        artist: 'James Miller',
        den: 'Den 6',
        bgColor: '#132150',
      },
      image
    );

    const res = await putArt(testDerby.id, form, headers);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.featured_art).toMatchObject({
      title: 'Lightning Wagon',
      artist: 'James M.',
      den: 'Den 6',
      bgColor: '#132150',
    });
    expect(json.featured_art.imageUrl).toMatch(
      new RegExp(`^/api/derby/${testDerby.id}/art/\\d+$`)
    );

    const imageRes = await GET(new Request('http://localhost'), {
      params: Promise.resolve({ id: String(testDerby.id), version: '1' }),
    });
    expect(imageRes.status).toBe(200);
    expect(imageRes.headers.get('content-type')).toBe('image/png');
    expect(new Uint8Array(await imageRes.arrayBuffer())).toEqual(PNG_BYTES);
  });

  test('it updates text without replacing the image', async () => {
    const { headers } = await createTestSessionAuth();
    const image = new File([PNG_BYTES], 'car.png', { type: 'image/png' });
    await putArt(testDerby.id, artForm({ artist: 'James' }, image), headers);

    const res = await putArt(
      testDerby.id,
      artForm({ artist: 'James', title: 'Rocket' }),
      headers
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.featured_art.title).toBe('Rocket');

    const art = await db.derby_art.findUnique({
      where: { derby_id: testDerby.id },
    });
    expect(art?.image_data).toEqual(PNG_BYTES);
  });

  test('it requires an image when the derby has none', async () => {
    const { headers } = await createTestSessionAuth();
    const res = await putArt(
      testDerby.id,
      artForm({ artist: 'James' }),
      headers
    );
    expect(res.status).toBe(400);
    expect(
      await db.derby_art.findUnique({ where: { derby_id: testDerby.id } })
    ).toBeNull();
  });

  test('it rejects files that are not images', async () => {
    const { headers } = await createTestSessionAuth();
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    const res = await putArt(
      testDerby.id,
      artForm({ artist: 'James' }, file),
      headers
    );
    expect(res.status).toBe(400);
  });

  test('it returns a 403 without an admin session', async () => {
    const { headers } = await createTestSessionAuth({ role: 'user' });
    const image = new File([PNG_BYTES], 'car.png', { type: 'image/png' });
    const res = await putArt(
      testDerby.id,
      artForm({ artist: 'James' }, image),
      headers
    );
    expect(res.status).toBe(403);
  });
});

describe('GET /api/derby/[id]/art/[version]', () => {
  test('it returns a 404 when there is no uploaded image', async () => {
    const res = await GET(new Request('http://localhost'), {
      params: Promise.resolve({ id: '999', version: '1' }),
    });
    expect(res.status).toBe(404);
  });
});
