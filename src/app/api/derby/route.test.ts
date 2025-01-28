import { GET } from './route';

describe('GET /api/derby', () => {
  test.only('it returns all derbies', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ derbies: [] });
  });
});
