import { IUserDAO } from '../interfaces/IUserDAO';
import { User } from '../../entities/User';
import { injectable } from 'inversify';
import { getConnection } from 'typeorm';

@injectable()
export class UserDAO implements IUserDAO {
    public async findUserWithId(userId: number): Promise<User | null> {
        return (await User.findOne({ where: { id: userId } })) || null;
    }

    public async findUserWithEmailAndUserName(email: string, username: string): Promise<User | null> {
        return (await User.findOne({ where: [{ email: email }, { username: username }] })) || null;
    }

    public async invalidateRefreshToken(user: User): Promise<void> {
        await getConnection()
            .createQueryBuilder()
            .update(User)
            .set({ count: user.count + 1 })
            .where('id = :id', { id: user.id })
            .execute();
    }

    public async createUser(username: string, email: string, password: string): Promise<User> {
        return await User.create({
            username,
            email,
            password,
            count: 0,
        }).save();
    }
}
