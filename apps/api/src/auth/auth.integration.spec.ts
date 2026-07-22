/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module.js';
import { MailService } from '../mail/mail.service.js';

describe('Auth and users integration', () => {
  let app: INestApplication;
  let verificationToken = '';
  let resetToken = '';
  const email = `integration-${Date.now()}@example.com`;
  const password = 'StrongPassword123!';
  const mail = { sendEmailVerification: (_email: string, token: string) => { verificationToken = token; return Promise.resolve(); }, sendPasswordReset: (_email: string, token: string) => { resetToken = token; return Promise.resolve(); } };
  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).overrideProvider(MailService).useValue(mail).compile();
    app = module.createNestApplication(); app.setGlobalPrefix('api/v1'); app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, exceptionFactory: () => new BadRequestException('Validation failed') })); await app.init();
  });
  afterAll(async () => app.close());

  it('forbids access without a token', () => request(app.getHttpServer()).get('/api/v1/auth/me').expect(401));
  it('registers and rejects duplicate email', async () => { const body = { email, password, passwordConfirmation: password, firstName: 'Integration', lastName: 'User' }; await request(app.getHttpServer()).post('/api/v1/auth/register').send(body).expect(201); await request(app.getHttpServer()).post('/api/v1/auth/register').send(body).expect(409); expect(verificationToken.length).toBeGreaterThan(32); });
  it('verifies email and rejects a reused token', async () => { await request(app.getHttpServer()).post('/api/v1/auth/verify-email').send({ token: verificationToken }).expect(201); await request(app.getHttpServer()).post('/api/v1/auth/verify-email').send({ token: verificationToken }).expect(400); });
  it('rejects a wrong password', () => request(app.getHttpServer()).post('/api/v1/auth/login').send({ email, password: 'wrong-password' }).expect(401));
  it('login, auth/me, users/me and profile update work', async () => { const login = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email, password }).expect(201); const access = login.body.accessToken as string; await request(app.getHttpServer()).get('/api/v1/auth/me').set('Authorization', `Bearer ${access}`).expect(200); await request(app.getHttpServer()).get('/api/v1/users/me').set('Authorization', `Bearer ${access}`).expect(200); const profile = await request(app.getHttpServer()).patch('/api/v1/users/me').set('Authorization', `Bearer ${access}`).send({ city: 'Yerevan', bio: 'Updated' }).expect(200); expect(profile.body.city).toBe('Yerevan'); });
  it('rotates refresh tokens and logout revokes the new session', async () => { const login = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email, password }).expect(201); const rotated = await request(app.getHttpServer()).post('/api/v1/auth/refresh').send({ refreshToken: login.body.refreshToken }).expect(201); await request(app.getHttpServer()).post('/api/v1/auth/refresh').send({ refreshToken: login.body.refreshToken }).expect(401); await request(app.getHttpServer()).post('/api/v1/auth/logout').set('Authorization', `Bearer ${rotated.body.accessToken}`).expect(201); await request(app.getHttpServer()).get('/api/v1/auth/me').set('Authorization', `Bearer ${rotated.body.accessToken}`).expect(401); });
  it('logout-all revokes every session', async () => { const first = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email, password }).expect(201); const second = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email, password }).expect(201); await request(app.getHttpServer()).post('/api/v1/auth/logout-all').set('Authorization', `Bearer ${first.body.accessToken}`).expect(201); await request(app.getHttpServer()).get('/api/v1/auth/me').set('Authorization', `Bearer ${second.body.accessToken}`).expect(401); });
  it('resets password and invalidates the token', async () => { await request(app.getHttpServer()).post('/api/v1/auth/forgot-password').send({ email }).expect(201); expect(resetToken.length).toBeGreaterThan(32); const next = 'NewStrongPassword123!'; await request(app.getHttpServer()).post('/api/v1/auth/reset-password').send({ token: resetToken, password: next, passwordConfirmation: next }).expect(201); await request(app.getHttpServer()).post('/api/v1/auth/reset-password').send({ token: resetToken, password: next, passwordConfirmation: next }).expect(400); await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email, password: next }).expect(201); });
});
