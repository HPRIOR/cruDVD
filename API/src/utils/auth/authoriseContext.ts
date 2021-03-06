import { ContextType } from '../../types/contextType';
import generateTokens from './generateTokens';
import { User } from '../../entities/User';
import { verify } from 'jsonwebtoken';
import express from 'express';

/*
Access token acts as a cache. If it is present the request in the context object will be modified to include user
info, but the User object in the context will be null as it is not looked up in the db.
This allows for db lookups to be delegated to resolvers, and user information to be retrieved in the context.
Consequently, lookups only occur when needed.If an access token is invalid, the refresh token makes a db lookup to check
if an access token can be created. If successful it creates new access and refresh token, and passes the user object to the
context so that the request can be made without another lookup when passed to the resolver - negating the need for two
when cache is refreshed.

 */

type ExpressReqRes = { req: express.Request; res: express.Response };
const authoriseContext = async ({ req, res }: ExpressReqRes): Promise<ContextType> => {
    const accessToken = req.cookies['access-token'];
    const refreshToken = req.cookies['refresh-token'];
    if (!accessToken && !refreshToken) {
        return { req, res, user: null };
    }
    return tryGenerateContextWithAccessToken({ req, res }, accessToken || '', refreshToken || '');
};

const tryGenerateContextWithAccessToken = async (
    { req, res }: ExpressReqRes,
    accessToken: string,
    refreshToken: string
): Promise<ContextType> => {
    const userInfo = tryGetUserInfoFromAccessToken(accessToken);
    // cache hit - don't do lookup user
    if (userInfo) {
        (req as any).userId = userInfo!.userId; // change to more general object about user so it can be used instead of lookup
        return { req, res, user: null };
    } else {
        // cache miss, look up to see if user is still valid
        return tryGenerateContextWithRefreshToken({ req, res }, refreshToken);
    }
};

const tryGenerateContextWithRefreshToken = async (
    { req, res }: ExpressReqRes,
    refreshToken: string
): Promise<ContextType> => {
    const user = await tryGetUserFromRefreshToken(refreshToken);
    if (user) {
        const { accessToken, refreshToken } = generateTokens(user);
        res.cookie('access-token', accessToken);
        res.cookie('refresh-token', refreshToken);
        (req as any).userId = user.id;
    }
    return { req, res, user };
};

const tryGetUserInfoFromAccessToken = (token: string): { userId: string; username: string } | null => {
    try {
        return verify(token, process.env.ACCESS_TOKEN_SECRET!) as { userId: string; username: string };
    } catch {}
    return null;
};

// this will only return a user if the refresh token is valid, and it matches count information in db
const tryGetUserFromRefreshToken = async (token: string) => {
    try {
        const userInfo = verify(token, process.env.REFRESH_TOKEN_SECRET!) as {
            userId: string;
            username: string;
            count: number;
        };
        // check if token is valid with db comparison
        const user = await User.findOne({
            where: { id: userInfo.userId, username: userInfo.username, count: userInfo.count },
        });
        return user ? user : null;
    } catch {}
    // invalid token
    return null;
};
export default authoriseContext;
