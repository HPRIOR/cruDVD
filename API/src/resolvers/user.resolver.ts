import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { User } from '../entities/User';
import generateTokens from '../utils/auth/generateTokens';
import * as argon2 from 'argon2';
import { RegisterInput } from './types/registerInput';
import { UserResponse } from './types/userResponse';
import { Context } from '../types/context';
import { ValidateUsernamePasswordInput } from '../utils/auth/types/validateUsernamePassswordInput';
import {
    passwordContainsSymbols,
    passwordContainsUpperCase,
    registerInputIsValid,
    shortPassword,
    shortUsername,
} from '../utils/auth/validateRegisterInput';
import { inject, injectable } from 'inversify';
import { TYPES } from '../container/types';
import { IUserDAO } from '../dao/interfaces/IUserDAO';

@injectable()
@Resolver()
export class UserResolver {
    private userDAO: IUserDAO;

    constructor(@inject(TYPES.IUserDAO) userDAO: IUserDAO) {
        this.userDAO = userDAO;
    }

    @Mutation(() => UserResponse, { nullable: true })
    async login(@Arg('input') input: RegisterInput, @Ctx() context: Context) {
        if (context.user) {
            return { user: context.user };
        }
        const user = await this.userDAO.findUserWithEmailAndUserName(input.email, input.username);
        const error = 'Invalid username or password';
        if (!user) {
            return { errors: [error] };
        }
        const validPass = await argon2.verify(user.password, input.password);
        if (!validPass) {
            return { errors: [error] };
        }
        const { accessToken, refreshToken } = generateTokens(user);

        context.res.cookie('access-token', accessToken);
        context.res.cookie('refresh-token', refreshToken);
        return { user };
    }

    @Mutation(() => UserResponse)
    async register(@Arg('input') input: RegisterInput, @Ctx() context: Context) {
        const inputValidators: ValidateUsernamePasswordInput[] = [
            shortPassword,
            shortUsername,
            passwordContainsSymbols,
            passwordContainsUpperCase,
        ];
        const errors = registerInputIsValid(input, inputValidators);

        const errorsExist = errors.userError || errors.passError || errors.emailError || errors.genericError;
        if (errorsExist) return { errors: errors };

        const encryptedPassword = await argon2.hash(input.password);
        const user = await this.userDAO.createUser(input.username, input.email, encryptedPassword);

        const { accessToken, refreshToken } = generateTokens(user);
        context.res.cookie('access-token', accessToken);
        context.res.cookie('refresh-token', refreshToken);

        return { user };
    }

    @Mutation(() => Boolean)
    async logout(@Ctx() context: Context) {
        const noUserLoggedIn = !context.user && !context.req.userId;
        if (noUserLoggedIn) {
            return false;
        }
        const user = await this.userDAO.findUserWithId(context.req.userId);
        if (!user) {
            return false;
        } else {
            context.res.clearCookie('access-token');
            context.res.clearCookie('refresh-token');
            context.user = null;
            await this.userDAO.invalidateRefreshToken(user);
            return true;
        }
    }

    @Query(() => User, { nullable: true })
    async checkLogin(@Ctx() context: any) {
        if (context.user) {
            return context.user;
        }
        const user = await this.userDAO.findUserWithId(context.req.userId);
        return user ? user : null;
    }
}
