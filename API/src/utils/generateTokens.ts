import { sign } from 'jsonwebtoken';
import { User } from '../entities/User';

const generateTokens = (user: User): { accessToken: string; refreshToken: string } => ({
    refreshToken: sign(
        { userId: user.id, username: user.username, count: user.count },
        process.env.REFRESH_TOKEN_SECRET!,
        {
            expiresIn: '7d',
        }
    ),
    accessToken: sign({ userId: user.id, username: user.username }, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: '15min',
    }),
});

export default generateTokens;
