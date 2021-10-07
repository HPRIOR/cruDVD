import { User } from '../../entities/User';
import { injectable } from 'inversify';

export interface IUserDAO {
    createUser(username: string, email: string, password: string): Promise<User>;
    invalidateRefreshToken(user: User): Promise<void>;
    findUserWithId(userId: number): Promise<User | null>;
    findUserWithEmailAndUserName(email: string, username: string): Promise<User | null>;
}
