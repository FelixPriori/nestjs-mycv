import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Authentication System (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
  
  it('handles a signup request', () => {
    const user = {email: 'asd@asdf.com', password: 'password'}
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send(user)
      .expect(201)
      .then((res) => {
        const {email, id} = res.body;
        expect(id).toBeDefined();
        expect(email).toEqual(user.email);
      })
  });

  it('signup as new user, and get the currently logged in user', async () => {
    const email = 'asdf@asdf.com'
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({email, password: 'asdf'})
      .expect(201);
    
    const cookie = response.get('Set-Cookie');

    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.email).toEqual(email);
  });
});
