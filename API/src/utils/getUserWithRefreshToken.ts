import { verify } from 'jsonwebtoken';
import { User } from '../entities/User';
const getUserFromAccessToken = async (token: string): Promise<User | null> => {
    try {
        const userInfo = verify(token, process.env.ACCESS_TOKEN_SECRET!) as { userId: string; username: string };
        const user = await User.findOne({ where: { id: userInfo.userId } });
        if (!user) {
            return null;
        }
        return user;
    } catch {}
    return null;
};

export default getUserFromAccessToken;