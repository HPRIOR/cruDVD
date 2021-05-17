import { ContextType } from '../types/ContextType';
import generateTokens from './generateTokens';
import { User } from '../entities/User';
import { verify } from 'jsonwebtoken';

/*
Access token acts as a cache. If it is present the request in the context object will be modified to include user
info, but the User object in the context will be null as it is not looked up in the db.
This allows for db lookups to be delegated to resolvers. Consequently, lookups only occur when needed.
If an access token is invalid, the refresh token makes a db lookup to check if an access token can be created.
If successful it creates new access and refresh token, and passes the user object to the
context so that the request can be made without another lookup when passed to the resolver - negating the need for two
when cache is refreshed.
 */
const authoriseContext = async ({ req, res }: any): Promise<ContextType> => {
    const accessToken = req.cookies['access-token'];
    const refreshToken = req.cookies['refresh-token'];
    if (!accessToken && !refreshToken) {
        return { req, res, user: null };
    }
    return context({ req, res }, accessToken || '', refreshToken || '');
};

const context = async ({ req, res }: any, accessToken: string, refreshToken: string): Promise<ContextType> => {
    const userInfo = await tryGetUserInfoFromAccessToken(accessToken);
    // cache hit - don't do lookup user
    if (userInfo) {
        req.userId = userInfo!.userId; // change to more general object about user so it can be used instead of lookup
        return { req, res, user: null };
    } else {
        // cache miss, look up to see if user is still valid
        return userInContext({ req, res }, refreshToken);
    }
};

const userInContext = async ({ req, res }: any, refreshToken: string): Promise<ContextType> => {
    const user = await getUserFromRefreshToken(refreshToken);
    if (user) {
        const { accessToken, refreshToken } = generateTokens(user);
        res.cookie('access-token', accessToken);
        res.cookie('refresh-token', refreshToken);
    }
    return { req, res, user };
};

const tryGetUserInfoFromAccessToken = async (token: string): Promise<{ userId: string; username: string } | null> => {
    try {
        return verify(token, process.env.ACCESS_TOKEN_SECRET!) as { userId: string; username: string };
    } catch {}
    return null;
};

const getUserFromRefreshToken = async (token: string) => {
    try {
        const userInfo = verify(token, process.env.REFRESH_TOKEN_SECRET!) as {
            userId: string;
            username: string;
            count: number;
        };
        const user = await User.findOne({ where: { id: userInfo.userId, count: userInfo.count } });
        return user ? user : null; // TODO problem not looging out properly
    } catch {}
    return null;
};
export default authoriseContext;
