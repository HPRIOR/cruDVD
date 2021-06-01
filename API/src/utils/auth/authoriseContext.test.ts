import authoriseContext from './authoriseContext';
import { verify } from 'jsonwebtoken';
import { User } from '../../entities/User';
import generateTokens from './generateTokens';

jest.mock('cookie-parser');
jest.mock('jsonwebtoken');
jest.mock('../../entities/User');
jest.mock('./generateTokens');

describe('authorise context', () => {
    it('should return null user if access or refresh tokens undefined', async () => {
        const context: any = { req: { cookies: {} }, res: {} };
        const result = await authoriseContext(context);
        expect(result).toStrictEqual({ req: { cookies: {} }, res: {}, user: null });
    });

    it('should return user id in context if access token is valid', async () => {
        const tokenCheckResult = { userId: '12345', username: 'test-user' };
        (verify as any).mockReturnValue(tokenCheckResult);
        const context: any = {
            req: { cookies: { 'access-token': '1234', 'refresh-token': '4321' } },
            res: {},
            user: null,
        };
        const result = await authoriseContext(context);
        expect(result).toStrictEqual({
            req: {
                cookies: { 'access-token': '1234', 'refresh-token': '4321' },
                userId: tokenCheckResult.userId,
            },
            res: {},
            user: null,
        });
    });

    it('should return user if: access-t: invalid, refresh-t: valid, matches db user', async () => {
        const tokenCheckResultOne = undefined;
        const tokenCheckResultTwo = { userId: '1234', username: 'test-user', count: 1 };
        (verify as any).mockReturnValueOnce(tokenCheckResultOne).mockReturnValueOnce(tokenCheckResultTwo);

        const mockUser = { id: '1234', username: 'test-user', email: 'test-email', count: 1 };
        (User.findOne as any).mockResolvedValue(mockUser);

        const tokens = { accessToken: 'access-token', refreshToken: 'refresh-token' };
        (generateTokens as any).mockReturnValue(tokens);

        // 'mock' express.res.cookie function
        let refreshToken;
        let accessToken;
        const context: any = {
            req: { cookies: { 'access-token': '1234', 'refresh-token': '4321' } },
            res: {
                cookie: (tokenKey: string, token: string) => {
                    if (tokenKey === 'access-token') {
                        accessToken = { 'access-token': 'signed-' + token };
                    }
                    if (tokenKey === 'refresh-token') {
                        refreshToken = { 'refresh-token': 'signed-' + token };
                    }
                },
            },
            user: null,
        };
        const result = await authoriseContext(context);

        // modify result to include mocked express.res.cookie call
        delete result.res.cookie;
        result.res.cookies = Object.assign(refreshToken, accessToken);
        expect(result).toStrictEqual({
            req: {
                userId: mockUser.id,
                cookies: { 'access-token': '1234', 'refresh-token': '4321' },
            },
            res: {
                cookies: {
                    'access-token': 'signed-access-token',
                    'refresh-token': 'signed-refresh-token',
                },
            },
            user: { id: mockUser.id, username: mockUser.username, email: mockUser.email, count: mockUser.count },
        });
    });

    it('should not user if: access-t: invalid, refresh-t: valid, no match with db', async () => {
        const tokenCheckResultOne = undefined;
        const tokenCheckResultTwo = { userId: '1234', username: 'test-user', count: 1 };
        (verify as any).mockReturnValueOnce(tokenCheckResultOne).mockReturnValueOnce(tokenCheckResultTwo);

        const mockUser = undefined;
        (User.findOne as any).mockResolvedValue(mockUser);

        const tokens = { accessToken: 'access-token', refreshToken: 'refresh-token' };
        (generateTokens as any).mockReturnValue(tokens);

        // 'mock' express.res.cookie function
        let refreshToken;
        let accessToken;
        const context: any = {
            req: { cookies: { 'access-token': '1234', 'refresh-token': '4321' } },
            res: {
                cookie: (tokenKey: string, token: string) => {
                    if (tokenKey === 'access-token') {
                        accessToken = { 'access-token': 'signed-' + token };
                    }
                    if (tokenKey === 'refresh-token') {
                        refreshToken = { 'refresh-token': 'signed-' + token };
                    }
                },
            },
            user: null,
        };
        const result = await authoriseContext(context);

        // modify result to include mocked express.res.cookie call
        expect(result).toStrictEqual(context);
    });
});
