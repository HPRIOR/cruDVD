import { verify } from 'jsonwebtoken';
import { User } from '../entities/User';

const getUserFromRefreshToken = async (token: string) => {
    try {
        const userInfo = verify(token, process.env.REFRESH_TOKEN_SECRET!) as {
            userId: string;
            username: string;
            count: number;
        };
        const user = await User.findOne({ where: { id: userInfo.userId } });
        return user && user.count === userInfo.count ? user : null;
    } catch {}
    return null;
};

export default getUserFromRefreshToken;
