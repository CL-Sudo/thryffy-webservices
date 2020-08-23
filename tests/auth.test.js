import request from 'supertest';
import { USER_TYPE } from '@constants';
import app from '../src/app';
import { userAuthenticator } from './utils';

describe('Authentication', () => {
  describe('[POST] - /api/mobile/auth/login', () => {
    it('shoud log user in when email and password is correct', async () => {
      const res = await request(app)
        .post('/api/mobile/auth/login')
        .send({
          email: 'lcl5280@hotmail.com',
          password: '1234'
        });

      expect(res.statusCode).toEqual(200);
    });

    it('should have "type" property representing customer type', async () => {
      const resEmail = await request(app)
        .post('/api/mobile/auth/login')
        .send({
          email: 'lcl5280@hotmail.com',
          password: '1234'
        });

      const resPhone = await request(app)
        .post('/api/mobile/auth/phone-login')
        .send({
          phoneNumber: '123456789',
          phoneCountryCode: '60',
          password: '1234'
        });
      expect(resEmail.body).toHaveProperty('payload.type', USER_TYPE.CUSTOMER);
      expect(resPhone.body).toHaveProperty('payload.type', USER_TYPE.CUSTOMER);
    });

    it('should not log user in with wrong password', async () => {
      const res = await request(app)
        .post('/api/mobile/auth/login')
        .send({
          email: 'lcl5280@hotmail.com',
          password: 'wrongPassword'
        });
      const resPhone = await request(app)
        .post('/api/mobile/auth/phone-login')
        .send({
          phoneNumber: '123456789',
          phoneCountryCode: '60',
          password: 'wrongPassword'
        });
      expect(res.statusCode).toEqual(500);
      expect(res).toHaveProperty('text', 'Password is incorrect, please try again...');

      expect(resPhone.statusCode).toEqual(500);
      expect(resPhone).toHaveProperty('text', 'Password is incorrect, please try again...');
    });
  });

  describe('[POST] - /api/mobile/auth/revoke', () => {
    it('should return 200 code', async () => {
      const { token } = await userAuthenticator();

      const res = await request(app)
        .post('/api/mobile/auth/revoke')
        .set('Authorization', token);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('payload.type', USER_TYPE.CUSTOMER);
    });
  });
});
