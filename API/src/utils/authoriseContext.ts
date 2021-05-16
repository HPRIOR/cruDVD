import { ContextType } from '../types/ContextType';
import getUserFromAccessToken from './getUserFromAccessToken';
import getUserFromRefreshToken from './getUserFromRefreshToken';
import generateTokens from './generateTokens';

const authoriseContext = async ({ req, res }: any): Promise<ContextType> => {
    const accessToken = req.cookies['access-token'];
    const refreshToken = req.cookies['refresh-token'];
    console.log(req.cookies);
    if (!accessToken && !refreshToken) {
        console.log('no access or refresh tokens');
        return { req, res, user: null };
    }
    if (accessToken) {
        console.log('access token found');
        const user = await getUserFromAccessToken(accessToken);
        return { req, res, user };
    } else if (refreshToken) {
        console.log('refresh token found');
        const user = await getUserFromRefreshToken(refreshToken);
        if (user) {
            const { accessToken, refreshToken } = generateTokens(user);
            res.cookie('access-token', accessToken);
            res.cookie('refresh-token', refreshToken);
        }
        return { req, res, user };
    }
    return { req, res, user: null };
};

export default authoriseContext;
