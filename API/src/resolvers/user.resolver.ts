import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { User } from '../entities/User';
import generateTokens from '../utils/generateTokens';
import { v4 as uuid } from 'uuid';
import * as argon2 from 'argon2';
import { UsernamePasswordInput } from './usernamePasswordInput';
import { UserResponse } from './userResponseType';
import { ContextType } from '../types/ContextType';
import { getConnection } from 'typeorm';

@Resolver()
export class UserResolver {
    @Mutation(() => UserResponse, { nullable: true })
    async login(@Arg('input') input: UsernamePasswordInput, @Ctx() context: ContextType) {
        if (context.user) {
            return { user: context.user };
        }
        const user = await User.findOne({ where: { username: input.username } });
        const error = 'Invalid username or password';
        if (!user) {
            return { error: [error] };
        }
        const validPass = await argon2.verify(input.password, user.password);
        if (!validPass) {
            return { error: [error] };
        }
        const { accessToken, refreshToken } = generateTokens(user);
        context.res.cookie('access-token', accessToken);
        context.res.cookie('refresh-token', refreshToken);
        return { user };
    }

    @Mutation(() => UserResponse)
    async register(@Arg('input') input: UsernamePasswordInput, @Ctx() context: ContextType) {
        const inputIsValid = true;
        if (!inputIsValid) return { error: ['invalid input'] }; // TODO
        const encryptedPassword = await argon2.hash(input.password);
        const user = await User.create({
            id: uuid(),
            username: input.username,
            password: encryptedPassword,
            count: 0,
        }).save();

        const { accessToken, refreshToken } = generateTokens(user);
        context.res.cookie('access-token', accessToken);
        context.res.cookie('refresh-token', refreshToken);
        return { user };
    }

    @Mutation(() => String)
    async logout() {
        return 'logout';
    }

    @Mutation(() => Boolean)
    async invalidateTokens(@Ctx() context: ContextType) {
        if (!context.user) {
            return false;
        }
        await getConnection()
            .createQueryBuilder()
            .update(User)
            .set({ count: context.user.count + 1 })
            .where('id = :id', { id: context.user.id })
            .execute();
        return true;
    }

    @Query(() => User, { nullable: true })
    async checkLogin(@Ctx() context: any) {
        return context.user;
    }
}
