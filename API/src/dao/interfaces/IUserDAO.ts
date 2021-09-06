import { RegisterInput } from '../../resolvers/types/registerInput';
import { User } from '../../entities/User';

interface IUserDAO {
    registerUser(username: string, email: string, password: string): Promise<User>;

    invalidateRefreshToken(user: User): Promise<User>;

    checkLogin(user: User): Promise<User>;
}
