const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Room = require('../src/models/Room');
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

describe('Room messages API', () => {
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

  test('allows room members to send and list messages', async () => {
    const owner = await registerUser({ name: 'Owner', email: 'owner@example.com', password: 'Password123' });
    const member = await registerUser({ name: 'Member', email: 'member@example.com', password: 'Password123' });

    const room = await Room.create({
      name: 'Test Room',
      ownerId: owner.user.id,
      participants: [member.user.id],
    });

    const sendResponse = await request(app)
      .post(`/api/rooms/${room.id}/messages`)
      .set('Authorization', `Bearer ${member.token}`)
      .send({ content: 'Hello everyone!' });

    expect(sendResponse.status).toBe(201);
    expect(sendResponse.body.content).toBe('Hello everyone!');
    expect(sendResponse.body.user.name).toBe('Member');

    const historyResponse = await request(app)
      .get(`/api/rooms/${room.id}/messages`)
      .set('Authorization', `Bearer ${owner.token}`);

    expect(historyResponse.status).toBe(200);
    expect(historyResponse.body).toHaveLength(1);
    expect(historyResponse.body[0].content).toBe('Hello everyone!');
  });

  test('rejects non-members and invalid payloads', async () => {
    const owner = await registerUser({ name: 'Owner', email: 'owner2@example.com', password: 'Password123' });
    const outsider = await registerUser({ name: 'Outsider', email: 'outsider@example.com', password: 'Password123' });

    const room = await Room.create({
      name: 'Private Room',
      ownerId: owner.user.id,
      participants: [],
    });

    const invalidPayload = await request(app)
      .post(`/api/rooms/${room.id}/messages`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ content: '' });

    expect(invalidPayload.status).toBe(400);

    const outsiderAttempt = await request(app)
      .post(`/api/rooms/${room.id}/messages`)
      .set('Authorization', `Bearer ${outsider.token}`)
      .send({ content: 'hi' });

    expect(outsiderAttempt.status).toBe(403);
    expect(outsiderAttempt.body.message).toMatch(/not a member/i);
  });
});
