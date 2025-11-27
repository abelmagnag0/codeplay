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

const loginUser = async (credentials) => {
  const response = await request(app).post('/api/auth/login').send(credentials);
  return {
    token: response.body.accessToken,
    user: response.body.user,
  };
};

const promoteToAdmin = async (userId) => {
  await User.findByIdAndUpdate(userId, { role: 'admin' });
};

describe('User API', () => {
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

  test('allows admins to list and manage users', async () => {
    const admin = await registerUser({ name: 'Admin', email: 'admin@example.com', password: 'Password123' });
    await promoteToAdmin(admin.user.id);
    const adminSession = await loginUser(admin.credentials);

    const member = await registerUser({ name: 'Regular Member', email: 'member@example.com', password: 'Password123' });

    const listResponse = await request(app)
      .get('/api/users')
      .query({ search: 'member', limit: 10 })
      .set('Authorization', `Bearer ${adminSession.token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].email).toBe(member.user.email);
    expect(listResponse.body[0]).not.toHaveProperty('password');

    const roleUpdate = await request(app)
      .patch(`/api/users/${member.user.id}/role`)
      .set('Authorization', `Bearer ${adminSession.token}`)
      .send({ role: 'admin' });

    expect(roleUpdate.status).toBe(200);
    expect(roleUpdate.body.role).toBe('admin');

    const statusUpdate = await request(app)
      .patch(`/api/users/${member.user.id}/status`)
      .set('Authorization', `Bearer ${adminSession.token}`)
      .send({ status: 'blocked' });

    expect(statusUpdate.status).toBe(200);
    expect(statusUpdate.body.status).toBe('blocked');

    const blockedList = await request(app)
      .get('/api/users')
      .query({ status: 'blocked' })
      .set('Authorization', `Bearer ${adminSession.token}`);

    expect(blockedList.status).toBe(200);
    expect(blockedList.body.map((user) => user.id)).toContain(member.user.id);
  });

  test('allows users to view and update their profile', async () => {
    const user = await registerUser({ name: 'Profile User', email: 'profile@example.com', password: 'Password123' });

    const profileResponse = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${user.token}`);

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.email).toBe('profile@example.com');

    const updateResponse = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ name: '  Updated Name  ', bio: '  Coding enthusiast ', avatar: 'https://example.com/avatar.png' });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.name).toBe('Updated Name');
    expect(updateResponse.body.bio).toBe('Coding enthusiast');
    expect(updateResponse.body.avatar).toBe('https://example.com/avatar.png');

    const meAfterUpdate = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${user.token}`);

    expect(meAfterUpdate.body.name).toBe('Updated Name');
  });

  test('enforces validation and authorization rules', async () => {
    const user = await registerUser({ name: 'Regular', email: 'regular@example.com', password: 'Password123' });

    const invalidProfile = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${user.token}`)
      .send({});

    expect(invalidProfile.status).toBe(400);

    const admin = await registerUser({ name: 'Admin', email: 'admin2@example.com', password: 'Password123' });
    await promoteToAdmin(admin.user.id);
    const adminSession = await loginUser(admin.credentials);

    const nonAdminList = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${user.token}`);

    expect(nonAdminList.status).toBe(403);

    const invalidRole = await request(app)
      .patch(`/api/users/${user.user.id}/role`)
      .set('Authorization', `Bearer ${adminSession.token}`)
      .send({ role: 'super-admin' });

    expect(invalidRole.status).toBe(400);

    const missingUser = await request(app)
      .patch(`/api/users/${new mongoose.Types.ObjectId().toHexString()}/status`)
      .set('Authorization', `Bearer ${adminSession.token}`)
      .send({ status: 'blocked' });

    expect(missingUser.status).toBe(404);

    const invalidId = await request(app)
      .patch('/api/users/not-a-valid-id/status')
      .set('Authorization', `Bearer ${adminSession.token}`)
      .send({ status: 'blocked' });

    expect(invalidId.status).toBe(400);
  });
});
