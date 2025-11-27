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
  };
};

describe('Room API', () => {
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

  test('allows authenticated users to create and join rooms', async () => {
    const owner = await registerUser({ name: 'Owner', email: 'room-owner@example.com', password: 'Password123' });

    const createResponse = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: ' Focus Group ', isPrivate: true });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.name).toBe('Focus Group');
    expect(createResponse.body.isPrivate).toBe(true);
    expect(createResponse.body.ownerId).toBe(owner.user.id);

    const roomId = createResponse.body.id || createResponse.body._id;
    expect(roomId).toBeTruthy();

    const participant = await registerUser({ name: 'Participant', email: 'participant@example.com', password: 'Password123' });

    const joinResponse = await request(app)
      .post(`/api/rooms/${roomId}/join`)
      .set('Authorization', `Bearer ${participant.token}`)
      .send();

    expect(joinResponse.status).toBe(200);
    const participants = (joinResponse.body.participants || []).map(String);
    expect(participants).toContain(participant.user.id);

    const listResponse = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${owner.token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].name).toBe('Focus Group');
  });

  test('rejects invalid payloads and identifiers', async () => {
    const user = await registerUser({ name: 'Tester', email: 'tester@example.com', password: 'Password123' });

    const invalidCreate = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ name: 'ab', isPrivate: 'nope' });

    expect(invalidCreate.status).toBe(400);

    const invalidJoin = await request(app)
      .post('/api/rooms/not-a-valid-id/join')
      .set('Authorization', `Bearer ${user.token}`)
      .send();

    expect(invalidJoin.status).toBe(400);

    const invalidGet = await request(app)
      .get('/api/rooms/not-a-valid-id')
      .set('Authorization', `Bearer ${user.token}`);

    expect(invalidGet.status).toBe(400);

    const invalidDelete = await request(app)
      .delete('/api/rooms/not-a-valid-id')
      .set('Authorization', `Bearer ${user.token}`);

    expect(invalidDelete.status).toBe(400);
  });
});
