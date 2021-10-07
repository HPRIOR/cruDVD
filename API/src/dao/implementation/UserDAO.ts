import { IUserDAO } from '../interfaces/IUserDAO';
import { User } from '../../entities/User';
import { injectable } from 'inversify';

@injectable()
export class UserDAO implements IUserDAO {
    public async findUserWithId(userId: number): Promise<User | null> {
        return (await User.findOne({ where: { id: userId } })) || null;
    }
    public async findUserWithEmailAndUserName(email: string, username: string): Promise<User | null> {
        return (await User.findOne({ where: [{ email: email }, { username: username }] })) || null;
    }
    public invalidateRefreshToken(user: User): Promise<User> {
        console.log(user);
        return Promise.resolve(new User());
    }

    public createUser(username: string, email: string, password: string): Promise<User> {
        console.log(username, email, password);
        return Promise.resolve(new User());
    }
}
