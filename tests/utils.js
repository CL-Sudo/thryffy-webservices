import request from 'supertest';
import app from '../src/app';

const agent = request(app);

export const userAuthenticator = async () => {
  const res = await agent
    .post('/api/mobile/auth/login')
    .send({ email: 'lcl5280@hotmail.com', password: '1234' });
  return res.body;
};
