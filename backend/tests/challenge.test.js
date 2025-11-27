const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');

let mongoServer;

const registerUser = async (payload, options = {}) => {
  const response = await request(app).post('/api/auth/register').send(payload);

  if (options.verify !== false) {
    await User.updateOne({ email: payload.email }, { emailVerified: true });
  }

  return {
    token: response.body.accessToken,
    user: response.body.user,
    credentials: { email: payload.email, password: payload.password },
  };
};

const promoteToAdmin = async (userId) => {
  await User.findByIdAndUpdate(userId, { role: 'admin' });
};

const loginUser = async (credentials) => {
  const response = await request(app).post('/api/auth/login').send(credentials);
  return {
    token: response.body.accessToken,
    user: response.body.user,
  };
};

describe('Challenge API', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '1h';
    process.env.BCRYPT_SALT_ROUNDS = '4';

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterEach(async () => {
    const { collections } = mongoose.connection;
    await Promise.all(Object.values(collections).map((collection) => collection.deleteMany()));
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  test('allows admins to manage challenges and filter listings', async () => {
    const admin = await registerUser({ name: 'Admin', email: 'admin@example.com', password: 'Password123' });
    await promoteToAdmin(admin.user.id);
    const adminSession = await loginUser(admin.credentials);

    const createResponse = await request(app)
      .post('/api/challenges')
      .set('Authorization', `Bearer ${adminSession.token}`)
      .send({
        title: ' Async Await Basics ',
        description: 'Learn how to work with async and await in modern JavaScript code.',
        difficulty: 'medium',
        category: 'javascript',
        xp: 300,
        starterCode: 'function solve() {\n  // TODO\n}',
        solution: 'function solve() { return true; }',
        tags: ['async', 'javascript'],
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.title).toBe('Async Await Basics');
    expect(createResponse.body.tags).toEqual(['async', 'javascript']);

    const challengeId = createResponse.body.id || createResponse.body._id;
    expect(challengeId).toBeTruthy();

    const secondaryChallenge = await request(app)
      .post('/api/challenges')
      .set('Authorization', `Bearer ${adminSession.token}`)
      .send({
        title: 'Array Manipulation',
        description: 'Practice array helper methods like map, reduce and filter.',
        difficulty: 'easy',
        category: 'javascript',
        xp: 150,
        tags: ['arrays', 'collections'],
      });

    expect(secondaryChallenge.status).toBe(201);

    const listResponse = await request(app)
      .get('/api/challenges')
      .query({ difficulty: 'medium', tags: 'javascript', minXp: 200 })
      .set('Authorization', `Bearer ${adminSession.token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].title).toBe('Async Await Basics');

    const updateResponse = await request(app)
      .put(`/api/challenges/${challengeId}`)
      .set('Authorization', `Bearer ${adminSession.token}`)
      .send({ xp: 500, tags: ['async', 'advanced'], category: 'javascript' });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.xp).toBe(500);
    expect(updateResponse.body.tags).toEqual(['async', 'advanced']);

    const getResponse = await request(app)
      .get(`/api/challenges/${challengeId}`)
      .set('Authorization', `Bearer ${adminSession.token}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.xp).toBe(500);

    const deleteResponse = await request(app)
      .delete(`/api/challenges/${challengeId}`)
      .set('Authorization', `Bearer ${adminSession.token}`);

    expect(deleteResponse.status).toBe(204);

    const afterDelete = await request(app)
      .get(`/api/challenges/${challengeId}`)
      .set('Authorization', `Bearer ${adminSession.token}`);

    expect(afterDelete.status).toBe(404);
  });

  test('rejects invalid payloads, ranges and unauthorized access', async () => {
    const regularUser = await registerUser({ name: 'User', email: 'user@example.com', password: 'Password123' });

    const forbiddenCreate = await request(app)
      .post('/api/challenges')
      .set('Authorization', `Bearer ${regularUser.token}`)
      .send({
        title: 'Hack the Planet',
        description: 'This should not work.',
        difficulty: 'hard',
        category: 'security',
      });

    expect(forbiddenCreate.status).toBe(403);

    const admin = await registerUser({ name: 'Another Admin', email: 'admin2@example.com', password: 'Password123' });
    await promoteToAdmin(admin.user.id);
    const adminSession = await loginUser(admin.credentials);

    const invalidCreate = await request(app)
      .post('/api/challenges')
      .set('Authorization', `Bearer ${adminSession.token}`)
      .send({
        title: 'JS',
        description: 'Too short',
        difficulty: 'medium',
        category: 'js',
      });

    expect(invalidCreate.status).toBe(400);

    const invalidId = await request(app)
      .get('/api/challenges/not-a-valid-id')
      .set('Authorization', `Bearer ${adminSession.token}`);

    expect(invalidId.status).toBe(400);

    const validButMissing = await request(app)
      .get(`/api/challenges/${new mongoose.Types.ObjectId().toHexString()}`)
      .set('Authorization', `Bearer ${adminSession.token}`);

    expect(validButMissing.status).toBe(404);

    const invalidRange = await request(app)
      .get('/api/challenges')
      .query({ minXp: 500, maxXp: 100 })
      .set('Authorization', `Bearer ${adminSession.token}`);

    expect(invalidRange.status).toBe(400);
    expect(invalidRange.body.message).toMatch(/minXp/i);
  });
});
