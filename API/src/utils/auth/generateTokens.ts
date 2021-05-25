import { sign } from 'jsonwebtoken';
import { User } from '../../entities/User';

const generateTokens = (user: User): { accessToken: string; refreshToken: string } => ({
    refreshToken: sign(
        { userId: user.id, username: user.email, count: user.count },
        process.env.REFRESH_TOKEN_SECRET!,
        {
            expiresIn: '7d',
        }
    ),
    accessToken: sign({ userId: user.id, username: user.email }, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: '2.5min',
    }),
});

export default generateTokens;
