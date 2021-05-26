import { Connection, getConnection } from 'typeorm';
import { testGqlCall } from '../test-utils/testGqlCall';
import { testDbConnection } from '../test-utils/testDbConnection';
import { User } from '../entities/User';
import { Express } from 'express';
import createExpressApp from '../config/createExpressApp';

describe('filmResolver', function () {
    let dbConn: Connection;
    let express: Express;
    beforeAll(async () => {
        dbConn = await testDbConnection();
        express = await createExpressApp();
    });
    afterEach(async () => {
        await getConnection().query(`
            DELETE from "user"
            Where true;
        `);
    });
    afterAll(async () => {
        await dbConn.close();
    });

    const checkLoginQuery = `
            query CheckLogin{
              checkLogin{
                id
                username
              }
            }
          `;

    const registerMutation = `
        mutation Register($input: RegisterInput!){
            register(input: $input){
                user {
                    username
                    email
                    id
                   }
                errors{
                    userError
                    passError
                    emailError
                    genericError
                    }
               }
            }
    `;

    const cookieFuncStub = (a: string, b: string) => [a, b];
    async function registerUser(
        cookieFunc: (a: string, b: string) => string[] = cookieFuncStub,
        input: { username?: string; password?: string; email?: string } = {
            username: 'test-user',
            password: 'Password1992£%!$%',
            email: 'test@test.com',
        }
    ) {
        return await testGqlCall({
            source: registerMutation,
            contextValue: {
                req: { userId: null },
                res: {
                    cookie: cookieFunc,
                },
                user: null,
            },
            variableValues: {
                input: input,
            },
        });
    }
    describe('Check login', () => {
        it('should return null when gqlResponse and req is undefined', async () => {
            const loggedIn = await testGqlCall({
                source: checkLoginQuery,
                contextValue: { req: { userId: undefined }, user: undefined },
            });
            expect(loggedIn.data?.checkLogin).toBeNull();
        });
        it('should return null when gqlResponse is undefined', async () => {
            const loggedIn = await testGqlCall({
                source: checkLoginQuery,
                contextValue: { req: { userId: null }, user: undefined },
            });
            expect(loggedIn.data?.checkLogin).toBeNull();
        });
        it('should return null when req is undefined', async () => {
            const loggedIn = await testGqlCall({
                source: checkLoginQuery,
                contextValue: { req: undefined, user: null },
            });
            expect(loggedIn.data?.checkLogin).toBeNull();
        });
        it('should return null when not logged in', async () => {
            const loggedIn = await testGqlCall({
                source: checkLoginQuery,
                contextValue: { req: { userId: null }, user: null },
            });
            expect(loggedIn.data?.checkLogin).toBeNull();
        });

        it('should return gqlResponse when in context', async () => {
            const gqlResponse = new User();
            gqlResponse.id = '1';
            gqlResponse.count = 0;
            gqlResponse.email = 'test.test@test.com';
            gqlResponse.username = 'test-user';
            gqlResponse.password = 'test-pass';
            const loggedIn = await testGqlCall({
                source: checkLoginQuery,
                contextValue: { req: { userId: null }, user: gqlResponse },
            });
            expect(loggedIn.data?.checkLogin.id).toBe('1');
            expect(loggedIn.data?.checkLogin.username).toBe('test-user');
        });

        it('should find gqlResponse in DB when gqlResponse id in context', async () => {
            const gqlResponse = await registerUser(cookieFuncStub);
            const loggedIn = await testGqlCall({
                source: checkLoginQuery,
                contextValue: { req: { userId: gqlResponse.data?.register.user.id }, user: null },
            });
            expect(loggedIn.data?.checkLogin.id).toBe(gqlResponse.data?.register.user.id);
            expect(loggedIn.data?.checkLogin.username).toBe('test-user');
        });
    });

    describe('register', () => {
        it('should return gqlResponse after registering ', async () => {
            const gqlResponse = await registerUser();
            expect(gqlResponse).not.toBeNull();
        });
        it('should return gqlResponse with correct username ', async () => {
            const gqlResponse = await registerUser();
            expect(gqlResponse.data?.register.user.username).toBe('test-user');
        });

        it('should return gqlResponse with correct email ', async () => {
            const gqlResponse = await registerUser();
            expect(gqlResponse.data?.register.user.email).toBe('test@test.com');
        });
        it('should return a gqlResponse with a count of 0', async () => {
            const gqlResponse = await registerUser();
            const dbUser = await User.findOne({ id: gqlResponse.data?.register.user.id });
            expect(dbUser?.count).toBe(0);
        });
        it('should call cookie creating function twice', async () => {
            const mockCallback = jest.fn((a: string, b: string) => [a, b]);
            await registerUser(mockCallback);
            expect(mockCallback.mock.calls.length).toBe(2);
        });

        it('should create access token', async () => {
            const mockCallback = jest.fn((a: string, b: string) => [a, b]);
            await registerUser(mockCallback);
            expect(mockCallback.mock.calls[0][0]).toBe('access-token');
        });

        it('should create refresh token', async () => {
            const mockCallback = jest.fn((a: string, b: string) => [a, b]);
            await registerUser(mockCallback);
            expect(mockCallback.mock.calls[1][0]).toBe('refresh-token');
        });

        it('should return error if password is too short', async () => {
            const gqlResponse = await registerUser((a, b) => [a, b], {
                username: 'test-user',
                password: 'pA%',
                email: 'test@test.com',
            });
            const error = gqlResponse.data?.register.errors.passError;
            expect(error).not.toBeNull();
            expect(error).toBeDefined();
        });

        it('should return error if username is too short', async () => {
            const gqlResponse = await registerUser((a, b) => [a, b], {
                username: 'ta',
                password: 'PassWord123%',
                email: 'test@test.com',
            });

            const error = gqlResponse.data?.register.errors.userError;
            expect(error).not.toBeNull();
            expect(error).toBeDefined();
        });

        it('should return error if password does not contain symbols', async () => {
            const gqlResponse = await registerUser((a, b) => [a, b], {
                username: 'test-user',
                password: 'PassWord',
                email: 'test@test.com',
            });

            const error = gqlResponse.data?.register.errors.passError;
            expect(error).not.toBeNull();
            expect(error).toBeDefined();
        });

        it('should return error if password does not contain upperCase', async () => {
            const gqlResponse = await registerUser((a, b) => [a, b], {
                username: 'test-user',
                password: 'password%@£$',
                email: 'test@test.com',
            });
            const error = gqlResponse.data?.register.errors.passError;
            expect(error).not.toBeNull();
            expect(error).toBeDefined();
        });

        it('should return error when email is missing', async () => {
            const gqlResponseNoEmail = await registerUser(cookieFuncStub, {
                username: 'username',
                password: 'Password1992%£@$',
            });
            const gqlError = gqlResponseNoEmail.errors;
            expect(gqlError).toBeDefined();
        });

        it('should return gql error when username is missing', async () => {
            const gqlResponseNoUsername = await registerUser(cookieFuncStub, {
                password: 'Password1992%£@$',
                email: 'test@test.com',
            });
            const gqlError = gqlResponseNoUsername.errors;
            expect(gqlError).toBeDefined();
        });
        it('should return error when password is missing', async () => {
            const gqlResponseNoPassword = await registerUser(cookieFuncStub, {
                username: 'username',
                email: 'test@test.com',
            });
            const gqlError = gqlResponseNoPassword.errors;
            expect(gqlError).toBeDefined();
        });
        it('should return error when username is in db', async () => {
            await registerUser(cookieFuncStub, {
                username: 'username',
                email: 'test@test.com',
                password: '1234afasFASD!£%!£%',
            });
            const gqlResponse = await registerUser(cookieFuncStub, {
                username: 'username',
                email: 'test@test2.com',
                password: '1234afasFASD!£%!£%',
            });
            const gqlError = gqlResponse.errors;
            expect(gqlError).toBeDefined();
        });

        it('should return error when email is already in db', async () => {
            await registerUser(cookieFuncStub, {
                username: 'username',
                email: 'test@test.com',
                password: '1234afasFASD!£%!£%',
            });
            const gqlResponse = await registerUser(cookieFuncStub, {
                username: 'username2',
                email: 'test@test.com',
                password: '1234afasFASD!£%!£%',
            });
            const gqlError = gqlResponse.errors;
            expect(gqlError).toBeDefined();
        });
    });
});
