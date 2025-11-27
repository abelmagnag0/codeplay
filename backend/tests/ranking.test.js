const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Challenge = require('../src/models/Challenge');
const User = require('../src/models/User');
const Room = require('../src/models/Room');
const Submission = require('../src/models/Submission');

let mongoServer;

const buildChallenge = (overrides = {}) =>
  Challenge.create({
    title: 'Default Challenge',
    description: 'Solve it',
    difficulty: 'easy',
    category: 'javascript',
    xp: 200,
    starterCode: 'function solution() {}',
    solution: 'function solution() { return true; }',
    ...overrides,
  });

describe('Ranking API', () => {
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

  const submitCorrectSolution = async ({ token }, challenge, extraPayload = {}) => {
    const response = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        challengeId: challenge.id,
        code: challenge.solution,
        ...extraPayload,
      });

    expect(response.status).toBe(201);
    return response.body;
  };

  test('returns global ranking sorted by XP and excludes blocked users', async () => {
    const challenge = await buildChallenge({ xp: 250, category: 'javascript' });
    const challengeTwo = await buildChallenge({ xp: 300, category: 'python' });

    const alice = await registerUser({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'Password123',
    });
    const bob = await registerUser({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'Password123',
    });
    const chris = await registerUser({
      name: 'Chris',
      email: 'chris@example.com',
      password: 'Password123',
    });

    await submitCorrectSolution(alice, challenge);
    await submitCorrectSolution(bob, challenge);
    await submitCorrectSolution(bob, challengeTwo);
    await submitCorrectSolution(chris, challenge);

    await User.updateOne({ _id: chris.user.id }, { status: 'blocked' });

    const response = await request(app).get('/api/ranking');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);

    expect(response.body[0].name).toBe('Bob');
    expect(response.body[0].xp).toBe(550);
    expect(response.body[0].rank).toBe(1);

    expect(response.body[1].name).toBe('Alice');
    expect(response.body[1].xp).toBe(250);
    expect(response.body[1].rank).toBe(2);
  });

  test('returns ranking filtered by category', async () => {
    const challengeJs = await buildChallenge({ xp: 200, category: 'javascript' });
    const challengePy = await buildChallenge({
      xp: 300,
      category: 'python',
      solution: 'function solution() { return 42; }',
    });

    const dana = await registerUser({
      name: 'Dana',
      email: 'dana@example.com',
      password: 'Password123',
    });
    const eric = await registerUser({
      name: 'Eric',
      email: 'eric@example.com',
      password: 'Password123',
    });

    await submitCorrectSolution(dana, challengeJs);
    await submitCorrectSolution(eric, challengeJs);
    await submitCorrectSolution(eric, challengePy);

    const jsRanking = await request(app).get('/api/ranking/category/javascript');
    expect(jsRanking.status).toBe(200);
    expect(jsRanking.body).toHaveLength(2);

    const jsNames = jsRanking.body.map((entry) => entry.name).sort();
    expect(jsNames).toEqual(['Dana', 'Eric']);
    jsRanking.body.forEach((entry) => {
      expect(entry.xp).toBe(200);
    });

    const pyRanking = await request(app).get('/api/ranking/category/python');
    expect(pyRanking.status).toBe(200);
    expect(pyRanking.body).toHaveLength(1);
    expect(pyRanking.body[0].name).toBe('Eric');
    expect(pyRanking.body[0].xp).toBe(300);
  });
  test('supports period and room filters', async () => {
    const challenge = await buildChallenge({ xp: 200, category: 'javascript' });

    const owner = await registerUser({
      name: 'RoomOwner',
      email: 'owner@example.com',
      password: 'Password123',
    });
    const member = await registerUser({
      name: 'RoomMember',
      email: 'member@example.com',
      password: 'Password123',
    });
    const outsider = await registerUser({
      name: 'Outsider',
      email: 'outsider@example.com',
      password: 'Password123',
    });

    const room = await Room.create({
      name: 'Focus Room',
      ownerId: owner.user.id,
      participants: [member.user.id],
    });

    await submitCorrectSolution(owner, challenge, { roomId: room.id });
    await submitCorrectSolution(member, challenge, { roomId: room.id });
    await submitCorrectSolution(outsider, challenge);

    const fortyDaysAgo = new Date();
    fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40);

    const ownerSubmissionRecord = await Submission.findOne({ userId: owner.user.id });
    expect(ownerSubmissionRecord).toBeTruthy();
    await Submission.collection.updateOne(
      { _id: ownerSubmissionRecord._id },
      { $set: { createdAt: fortyDaysAgo } },
      { bypassDocumentValidation: true }
    );

    const roomRanking = await request(app).get(`/api/ranking?roomId=${room.id}`);
    expect(roomRanking.status).toBe(200);
    expect(roomRanking.body).toHaveLength(2);
    expect(roomRanking.body[0].userId).toBe(member.user.id);
    expect(roomRanking.body[1].userId).toBe(owner.user.id);

    const monthlyRanking = await request(app).get('/api/ranking?period=monthly&limit=5');
    expect(monthlyRanking.status).toBe(200);
    const monthlyIds = monthlyRanking.body.map((entry) => entry.userId);
    expect(monthlyIds).toContain(member.user.id);
    expect(monthlyIds).toContain(outsider.user.id);
    expect(monthlyIds).not.toContain(owner.user.id);

    const customRange = await request(app)
      .get('/api/ranking?period=custom&from=2020-01-01T00:00:00.000Z&to=2020-12-31T23:59:59.999Z');

    expect(customRange.status).toBe(200);
    expect(customRange.body).toHaveLength(0);
  });
});
