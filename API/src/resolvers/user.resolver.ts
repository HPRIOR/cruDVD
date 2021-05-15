import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { User } from '../entities/User';
import generateTokens from '../utils/generateTokens';
import { v4 as uuid } from 'uuid';
import * as argon2 from 'argon2';
import getUserFromAccessToken from '../utils/getUserWithRefreshToken';
import { UsernamePasswordInput } from './usernamePasswordInput';
import { UserResponse } from './userResponseType';

@Resolver()
export class UserResolver {
    // @Mutation(() => UserResponse, { nullable: true })
    // async login(@Arg('input') input: UsernamePasswordInput) {
    // }

    @Mutation(() => UserResponse)
    async register(@Arg('input') input: UsernamePasswordInput, @Ctx() context: any) {
        const inputIsValid = true;
        if (!inputIsValid) return null; // TODO
        const encryptedPassword = await argon2.hash(input.password);
        const newUser = await User.create({ id: uuid(), username: input.username, password: encryptedPassword }).save();
        const { accessToken, refreshToken } = generateTokens(newUser);
        context.res.cookie('access-token', accessToken);
        context.res.cookie('refresh-token', refreshToken);
        return { user: newUser };
    }

    @Mutation(() => String)
    async logout() {
        return 'logout';
    }

    @Query(() => User, { nullable: true })
    async checkLogin(@Ctx() context: any) {
        const user = await getUserFromAccessToken(context.req.userId);
        return user ? user : null;
    }
}
