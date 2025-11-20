import request from 'supertest';
import app from '../server/app';
import prisma from '../PrismaClient';

beforeAll(async () => {
  // Clear the table before tests
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('User API', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({ name: 'Nazeem', email: 'nazeem@example.com' });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should get all users', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
