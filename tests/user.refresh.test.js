import request from 'supertest';
import { app } from '../src/app.js';
import { User } from '../src/models/user.model.js';
import jwt from 'jsonwebtoken';

jest.mock('../src/middlewares/auth.middleware.js', () => ({
  verifyJWT: (_req, _res, next) => next(),
}));

jest.mock('../src/models/user.model.js');
jest.mock('jsonwebtoken');

describe('POST /api/v1/users/refresh-token', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REFRESH_TOKEN_SECRET = 'secret';
  });

  it('returns new tokens for a valid refresh token', async () => {
    const validToken = 'validRefreshToken';
    const newAccessToken = 'newAccessToken';
    const newRefreshToken = 'newRefreshToken';

    const mockUser = {
      _id: 'user123',
      refreshToken: validToken,
      generateAccessToken: jest.fn().mockReturnValue(newAccessToken),
      generateRefreshToken: jest.fn().mockReturnValue(newRefreshToken),
      save: jest.fn().mockResolvedValue(),
    };

    User.findById.mockResolvedValue(mockUser);
    jwt.verify.mockReturnValue({ id: 'user123' });

    const res = await request(app)
      .post('/api/v1/users/refresh-token')
      .set('Cookie', `refreshToken=${validToken}`)
      .expect(200);

    expect(res.body.data).toEqual({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
    const cookies = res.headers['set-cookie'].join(';');
    expect(cookies).toContain(`refreshToken=${newRefreshToken}`);
    expect(cookies).toContain(`accessToken=${newAccessToken}`);
  });
});

