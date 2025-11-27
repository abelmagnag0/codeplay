const request = require('supertest');

jest.mock('../src/services/emailService', () => ({
  sendEmailVerification: jest.fn().mockResolvedValue(),
  sendPasswordReset: jest.fn().mockResolvedValue(),
}));

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const emailService = require('../src/services/emailService');

let mongoServer;

describe('Auth API', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '1h';
    process.env.BCRYPT_SALT_ROUNDS = '4';
    process.env.EMAIL_VERIFICATION_TTL_HOURS = '48';
    process.env.PASSWORD_RESET_TTL_MINUTES = '60';
    process.env.APP_URL = 'http://localhost:5173';

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterEach(async () => {
    const { collections } = mongoose.connection;
    await Promise.all(
      Object.values(collections).map((collection) => collection.deleteMany())
    );
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  const registerPayload = {
    name: 'Test User',
    email: 'user@example.com',
    password: 'Password123',
  };

  const registerUser = async (overrides = {}) => {
    const payload = { ...registerPayload, ...overrides };
    const response = await request(app).post('/api/auth/register').send(payload);
    return { response, payload };
  };

  const markEmailVerified = async (email) => {
    await User.updateOne({ email }, { emailVerified: true });
  };

  test('registers a user and returns tokens', async () => {
    const { response } = await registerUser();

    expect(response.status).toBe(201);
    expect(response.body.accessToken).toBeTruthy();
    expect(response.body.refreshToken).toBeTruthy();
    expect(response.body.user.email).toBe(registerPayload.email);
    expect(response.body.user).not.toHaveProperty('password');
    expect(response.body.user.emailVerified).toBe(false);
    expect(emailService.sendEmailVerification).toHaveBeenCalledTimes(1);

    const savedUser = await User.findOne({ email: registerPayload.email })
      .select('+refreshTokens')
      .lean();
    expect(savedUser).toBeTruthy();
    expect(savedUser.password).not.toBe(registerPayload.password);
    expect(savedUser.refreshTokens.length).toBe(1);
    expect(savedUser.emailVerification).toBeTruthy();
    expect(savedUser.emailVerification.token).toHaveLength(64);
    expect(savedUser.emailVerification.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  test('rejects login until email is verified', async () => {
    await registerUser();

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: registerPayload.email, password: registerPayload.password });

    expect(loginResponse.status).toBe(403);
    expect(loginResponse.body.message).toMatch(/verification/i);
  });

  test('rejects registration payload missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'X', email: 'not-an-email', password: '123' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/name length must be at least/i),
        expect.stringMatching(/email must be a valid email/i),
        expect.stringMatching(/password length must be at least/i),
      ])
    );
  });

  test('prevents duplicate registrations', async () => {
    await request(app).post('/api/auth/register').send(registerPayload);
    const duplicate = await request(app).post('/api/auth/register').send(registerPayload);

    expect(duplicate.status).toBe(409);
    expect(duplicate.body.message).toMatch(/already registered/i);
  });

  test('logs in existing user and rotates refresh token', async () => {
    await registerUser();
    await markEmailVerified(registerPayload.email);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: registerPayload.email, password: registerPayload.password });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.accessToken).toBeTruthy();
    expect(loginResponse.body.refreshToken).toBeTruthy();
    expect(loginResponse.body.user.email).toBe(registerPayload.email);

    const userRecord = await User.findOne({ email: registerPayload.email })
      .select('+refreshTokens')
      .lean();
    expect(userRecord.refreshTokens.length).toBe(2);
  });

  test('rejects login with invalid payload', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'invalid', password: '123' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/email must be a valid email/i),
        expect.stringMatching(/password length must be at least/i),
      ])
    );
  });

  test('rejects login with invalid credentials', async () => {
    await registerUser();
    await markEmailVerified(registerPayload.email);

    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: registerPayload.email, password: 'WrongPass1' });

    expect(wrongPassword.status).toBe(401);
  });

  test('refresh token rotation works and invalidates old token', async () => {
    const { response: registerResponse } = await registerUser();
    await markEmailVerified(registerPayload.email);

    const oldRefreshToken = registerResponse.body.refreshToken;

    const refreshResponse = await request(app)
      .post('/api/auth/refresh')
      .send({ token: oldRefreshToken });

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.refreshToken).toBeTruthy();
    expect(refreshResponse.body.accessToken).toBeTruthy();
    expect(refreshResponse.body.refreshToken).not.toBe(oldRefreshToken);

    const reuseAttempt = await request(app)
      .post('/api/auth/refresh')
      .send({ token: oldRefreshToken });

    expect(reuseAttempt.status).toBe(401);
  });

  test('verifies email token and allows subsequent login', async () => {
    await registerUser();

    const userRecord = await User.findOne({ email: registerPayload.email }).lean();
    const token = userRecord.emailVerification.token;

    const verifyResponse = await request(app)
      .post('/api/auth/email/verify')
      .send({ token });

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.user.emailVerified).toBe(true);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: registerPayload.email, password: registerPayload.password });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.user.emailVerified).toBe(true);
  });

  test('resends verification email for unverified account', async () => {
    await registerUser();
    emailService.sendEmailVerification.mockClear();

    const resendResponse = await request(app)
      .post('/api/auth/email/resend')
      .send({ email: registerPayload.email });

    expect(resendResponse.status).toBe(204);
    expect(emailService.sendEmailVerification).toHaveBeenCalledTimes(1);
  });

  test('blocked users cannot login or refresh tokens', async () => {
    const { response: registerResponse } = await registerUser();
    await markEmailVerified(registerPayload.email);

    const initialRefreshToken = registerResponse.body.refreshToken;

    await User.updateOne({ email: registerPayload.email }, { status: 'blocked' });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: registerPayload.email, password: registerPayload.password });

    expect(loginResponse.status).toBe(403);

    const refreshAttempt = await request(app)
      .post('/api/auth/refresh')
      .send({ token: initialRefreshToken });

    expect([401, 403]).toContain(refreshAttempt.status);
  });

  test('initiates and completes password reset flow', async () => {
    await registerUser();
    await markEmailVerified(registerPayload.email);

    const forgotResponse = await request(app)
      .post('/api/auth/password/forgot')
      .send({ email: registerPayload.email });

    expect(forgotResponse.status).toBe(204);
    expect(emailService.sendPasswordReset).toHaveBeenCalledTimes(1);

    const userWithReset = await User.findOne({ email: registerPayload.email })
      .select('+refreshTokens')
      .lean();

    expect(userWithReset.passwordReset.token).toHaveLength(64);

    const resetResponse = await request(app)
      .post('/api/auth/password/reset')
      .send({ token: userWithReset.passwordReset.token, password: 'NewPassword321' });

    expect(resetResponse.status).toBe(204);

    const failedLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: registerPayload.email, password: registerPayload.password });

    expect(failedLogin.status).toBe(401);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: registerPayload.email, password: 'NewPassword321' });

    expect(loginResponse.status).toBe(200);

    const refreshedUser = await User.findOne({ email: registerPayload.email })
      .select('+refreshTokens')
      .lean();
    expect(refreshedUser.refreshTokens.length).toBe(1);
  });

  test('password reset request for unknown email responds with 204', async () => {
    const response = await request(app)
      .post('/api/auth/password/forgot')
      .send({ email: 'unknown@example.com' });

    expect(response.status).toBe(204);
    expect(emailService.sendPasswordReset).not.toHaveBeenCalled();
  });

  test('lists and revokes active sessions', async () => {
    await registerUser();
    await markEmailVerified(registerPayload.email);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: registerPayload.email, password: registerPayload.password });

    const token = loginResponse.body.accessToken;

    const sessionsResponse = await request(app)
      .get('/api/auth/sessions')
      .set('Authorization', `Bearer ${token}`);

    expect(sessionsResponse.status).toBe(200);
    expect(Array.isArray(sessionsResponse.body.sessions)).toBe(true);
    expect(sessionsResponse.body.sessions.length).toBeGreaterThan(0);

    const sessionId = sessionsResponse.body.sessions[0].id;

    const revokeResponse = await request(app)
      .delete(`/api/auth/sessions/${sessionId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(revokeResponse.status).toBe(204);

    const postRevokeSessions = await request(app)
      .get('/api/auth/sessions')
      .set('Authorization', `Bearer ${token}`);

    expect(postRevokeSessions.status).toBe(200);
    expect(postRevokeSessions.body.sessions.length).toBeLessThan(
      sessionsResponse.body.sessions.length
    );
  });

  test('logout revokes refresh token', async () => {
    const { response: registerResponse } = await registerUser();
    await markEmailVerified(registerPayload.email);

    const refreshToken = registerResponse.body.refreshToken;

    const logoutResponse = await request(app)
      .post('/api/auth/logout')
      .send({ token: refreshToken });

    expect(logoutResponse.status).toBe(200);

    const refreshAttempt = await request(app)
      .post('/api/auth/refresh')
      .send({ token: refreshToken });

    expect(refreshAttempt.status).toBe(401);
  });
});
