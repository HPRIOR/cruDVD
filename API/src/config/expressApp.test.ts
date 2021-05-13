import createExpressApp from './createExpressApp';
import { Express } from 'express';
import request from 'supertest';

describe('expressApp', () => {
  let app: Express;

  beforeEach(async () => {
    app = await createExpressApp();
  });

  it('should redirect to /graphql', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(302);
  });
});
