import { db } from '@/api-biz/db';
import { car, den, derby } from '@generated/client';
import { NextRequest } from 'next/server';
import { DELETE, GET, POST } from './route';

describe('GET /api/car', () => {
  let testDerby: derby;
  let testDen: den;
  let testCar: car;

  beforeEach(async () => {
    testDerby = await db.derby.create({
      data: {
        time: new Date(),
        created_at: new Date(),
        location_name: 'Test Location',
      },
    });

    testDen = await db.den.create({
      data: {
        name: 'Test Den',
        derby_id: testDerby.id,
      },
    });

    testCar = await db.car.create({
      data: {
        den_id: testDen.id,
        number: 1,
        owner: 'Test Owner',
      },
    });
  });

  test('it returns cars for a given derby', async () => {
    const url = new URL('http://localhost/api/car');
    url.searchParams.set('derby_id', testDerby.id.toString());
    const request = new NextRequest(url.toString());

    const res = await GET(request);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.cars.length).toBe(1);
    expect(json.cars[0].id).toBe(testCar.id);
  });

  test('it returns a 400 if derby_id is missing', async () => {
    const request = new NextRequest('http://localhost/api/car');
    const res = await GET(request);
    expect(res.status).toBe(400);
  });

  test('it returns a 400 if derby_id is invalid', async () => {
    const url = new URL('http://localhost/api/car');
    url.searchParams.set('derby_id', '99999');
    const request = new NextRequest(url.toString());

    const res = await GET(request);
    expect(res.status).toBe(400);
  });
});

describe('POST /api/car', () => {
  let testDerby: derby;
  let testDen: den;

  beforeEach(async () => {
    testDerby = await db.derby.create({
      data: {
        time: new Date(),
        created_at: new Date(),
        location_name: 'Test Location',
      },
    });

    testDen = await db.den.create({
      data: {
        name: 'Test Den',
        derby_id: testDerby.id,
      },
    });
  });

  test('it creates a new car', async () => {
    const carData = {
      denId: testDen.id,
      carNumber: 2,
      owner: 'New Owner',
      carName: 'Speedy',
    };

    const request = new NextRequest('http://localhost/api/car', {
      method: 'POST',
      body: JSON.stringify(carData),
    });

    const res = await POST(request);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.id).toBeDefined();
    expect(json.number).toBe(carData.carNumber);
    expect(json.owner).toBe(carData.owner);
  });

  test('it returns a 409 if a car with the same number exists in the den', async () => {
    await db.car.create({
      data: {
        den_id: testDen.id,
        number: 3,
        owner: 'Existing Owner',
      },
    });

    const carData = {
      denId: testDen.id,
      carNumber: 3,
      owner: 'Another Owner',
    };

    const request = new NextRequest('http://localhost/api/car', {
      method: 'POST',
      body: JSON.stringify(carData),
    });

    const res = await POST(request);
    expect(res.status).toBe(409);
  });

  test('it returns a 400 for an invalid payload', async () => {
    const request = new NextRequest('http://localhost/api/car', {
      method: 'POST',
      body: JSON.stringify({ carNumber: 4 }),
    });

    const res = await POST(request);
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/car', () => {
  let testDerby: derby;
  let testDen: den;
  let testCar: car;

  beforeEach(async () => {
    testDerby = await db.derby.create({
      data: {
        time: new Date(),
        created_at: new Date(),
        location_name: 'Test Location',
      },
    });

    testDen = await db.den.create({
      data: {
        name: 'Test Den',
        derby_id: testDerby.id,
      },
    });

    testCar = await db.car.create({
      data: {
        den_id: testDen.id,
        number: 1,
        owner: 'Test Owner',
      },
    });
  });

  test('it deletes a car', async () => {
    const url = new URL('http://localhost/api/car');
    url.searchParams.set('id', testCar.id.toString());
    const request = new NextRequest(url.toString(), { method: 'DELETE' });

    const res = await DELETE(request);
    expect(res.status).toBe(204);

    const deletedCar = await db.car.findUnique({ where: { id: testCar.id } });
    expect(deletedCar).toBeNull();
  });

  test('it returns a 400 if id is missing', async () => {
    const request = new NextRequest('http://localhost/api/car', {
      method: 'DELETE',
    });
    const res = await DELETE(request);
    expect(res.status).toBe(400);
  });

  test('it returns a 400 if id is not a number', async () => {
    const url = new URL('http://localhost/api/car');
    url.searchParams.set('id', 'abc');
    const request = new NextRequest(url.toString(), { method: 'DELETE' });

    const res = await DELETE(request);
    expect(res.status).toBe(400);
  });
});
