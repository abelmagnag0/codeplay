const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Challenge = require('../src/models/Challenge');
const User = require('../src/models/User');
const Submission = require('../src/models/Submission');

let mongoServer;

const baseUser = {
  name: 'Coder One',
  email: 'coder@example.com',
  password: 'Password123',
};

const createChallenge = (overrides = {}) =>
  Challenge.create({
    title: 'Sum Two Numbers',
    description: 'Return the sum of a and b',
    difficulty: 'easy',
    category: 'javascript',
    xp: 150,
    starterCode: 'function sum(a,b) { }',
    solution: 'function sum(a, b) { return a + b; }',
    ...overrides,
  });

describe('Submission API', () => {
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

  const registerAndGetToken = async (userPayload = baseUser, options = {}) => {
    const response = await request(app).post('/api/auth/register').send(userPayload);

    if (options.verify !== false) {
      await User.updateOne({ email: userPayload.email }, { emailVerified: true });
    }

    return {
      token: response.body.accessToken,
      userId: response.body.user.id,
    };
  };

  test('accepts correct submission, awards XP and updates level', async () => {
    const challenge = await createChallenge({ xp: 200 });
    const { token, userId } = await registerAndGetToken();

    const res = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        challengeId: challenge.id,
        code: 'function sum(a, b) { return a + b; }',
        language: 'javascript',
      });

    expect(res.status).toBe(201);
    expect(res.body.isCorrect).toBe(true);
    expect(res.body.awardedXp).toBe(200);
    expect(res.body.challengeId).toBe(challenge.id.toString());

    const updatedUser = await User.findById(userId);
    expect(updatedUser.xp).toBe(200);
    expect(updatedUser.level).toBeGreaterThanOrEqual(1);

    const submissions = await Submission.find({ userId });
    expect(submissions).toHaveLength(1);
    expect(submissions[0].isCorrect).toBe(true);
  });

  test('handles incorrect submission without awarding XP', async () => {
    const challenge = await createChallenge();
    const { token, userId } = await registerAndGetToken({
      name: 'Coder Two',
      email: 'coder2@example.com',
      password: 'Password123',
    });

    const res = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        challengeId: challenge.id,
        code: 'function sum() { return 0; }',
      });

    expect(res.status).toBe(201);
    expect(res.body.isCorrect).toBe(false);
    expect(res.body.awardedXp).toBe(0);

    const updatedUser = await User.findById(userId);
    expect(updatedUser.xp).toBe(0);
  });

  test('validates payload and requires authentication', async () => {
    const challenge = await createChallenge();
    const { token } = await registerAndGetToken({
      name: 'Coder Three',
      email: 'coder3@example.com',
      password: 'Password123',
    });

    const validationResponse = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'function sum() {}' });

    expect(validationResponse.status).toBe(400);

    const authResponse = await request(app)
      .post('/api/submissions')
      .send({ challengeId: challenge.id, code: challenge.solution });

    expect(authResponse.status).toBe(401);
  });

  test('returns 404 for unknown challenge', async () => {
    const { token } = await registerAndGetToken({
      name: 'Coder Four',
      email: 'coder4@example.com',
      password: 'Password123',
    });

    const response = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        challengeId: new mongoose.Types.ObjectId().toString(),
        code: 'function sum() { return 1; }',
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/challenge not found/i);
  });
});
