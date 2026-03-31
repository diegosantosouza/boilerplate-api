import request from 'supertest';
import app from '@/shared/config/app';
import {
  clearCollections,
  connectTestDb,
  disconnectTestDb,
} from '../../helpers/db-helper';

describe('Items CRUD (Integration)', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  afterEach(async () => {
    await clearCollections();
  });

  const validItem = {
    name: 'Test Item',
    description: 'Integration test item',
    price: 19.99,
    category: 'testing',
  };

  describe('POST /items', () => {
    it('should create an item and persist in database', async () => {
      const res = await request(app).post('/items').send(validItem).expect(201);

      expect(res.body).toMatchObject({
        name: 'Test Item',
        description: 'Integration test item',
        price: 19.99,
        category: 'testing',
        active: true,
      });
      expect(res.body.id).toBeDefined();
      expect(res.body.createdAt).toBeDefined();
      expect(res.body.updatedAt).toBeDefined();
    });

    it('should return 400 for empty payload', async () => {
      const res = await request(app).post('/items').send({}).expect(400);

      expect(res.body.status).toBe(400);
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/items')
        .send({ name: 'Incomplete' })
        .expect(400);

      expect(res.body.status).toBe(400);
    });
  });

  describe('GET /items/:id', () => {
    it('should return an item by id', async () => {
      const created = await request(app).post('/items').send(validItem);

      const res = await request(app)
        .get(`/items/${created.body.id}`)
        .expect(200);

      expect(res.body.name).toBe('Test Item');
      expect(res.body.id).toBe(created.body.id);
    });

    it('should return 404 for non-existent item', async () => {
      await request(app).get('/items/000000000000000000000000').expect(404);
    });
  });

  describe('PATCH /items/:id', () => {
    it('should update an existing item', async () => {
      const created = await request(app).post('/items').send(validItem);

      const res = await request(app)
        .patch(`/items/${created.body.id}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(res.body.name).toBe('Updated Name');
      expect(res.body.description).toBe('Integration test item');
    });

    it('should return 404 when updating non-existent item', async () => {
      await request(app)
        .patch('/items/000000000000000000000000')
        .send({ name: 'Ghost' })
        .expect(404);
    });
  });

  describe('DELETE /items/:id', () => {
    it('should delete an existing item', async () => {
      const created = await request(app).post('/items').send(validItem);

      await request(app).delete(`/items/${created.body.id}`).expect(204);

      await request(app).get(`/items/${created.body.id}`).expect(404);
    });

    it('should return 404 when deleting non-existent item', async () => {
      await request(app).delete('/items/000000000000000000000000').expect(404);
    });
  });

  describe('GET /items (list with pagination)', () => {
    it('should return paginated list', async () => {
      await Promise.all([
        request(app)
          .post('/items')
          .send({ ...validItem, name: 'Item 1' }),
        request(app)
          .post('/items')
          .send({ ...validItem, name: 'Item 2' }),
        request(app)
          .post('/items')
          .send({ ...validItem, name: 'Item 3' }),
      ]);

      const res = await request(app).get('/items?page=1&limit=2').expect(200);

      expect(res.body.items).toHaveLength(2);
      expect(res.body.totalItems).toBe(3);
      expect(res.body.totalPages).toBe(2);
      expect(res.body.hasNextPage).toBe(true);
      expect(res.body.hasPrevPage).toBe(false);
    });

    it('should return empty list when no items', async () => {
      const res = await request(app).get('/items').expect(200);

      expect(res.body.items).toHaveLength(0);
      expect(res.body.totalItems).toBe(0);
    });

    it('should filter by category', async () => {
      await request(app)
        .post('/items')
        .send({ ...validItem, category: 'electronics' });
      await request(app)
        .post('/items')
        .send({ ...validItem, category: 'books' });

      const res = await request(app)
        .get('/items?category=electronics')
        .expect(200);

      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].category).toBe('electronics');
    });
  });
});
