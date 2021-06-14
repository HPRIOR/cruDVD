import { Connection, getConnection } from 'typeorm';
import { testDbConnection } from '../test-utils/testDbConnection';
import { testGqlCall } from '../test-utils/testGqlCall';
import { Express } from 'express';
import createExpressApp from '../config/createExpressApp';

describe('Comment resolver', () => {
    let dbConn: Connection;
    let express: Express;
    beforeAll(async () => {
        dbConn = await testDbConnection();
        express = await createExpressApp();

        await getConnection().query(`
            INSERT INTO "crudDVDTestDB".public."user"
            VALUES (1, 'test-user', 'test-user@email.com', '12345asdafFASD£$', 1);
        `);
    });
    afterAll(async () => {
        await dbConn.close();
    });
    afterEach(async () => {
        await getConnection().query(`
            DELETE
            from "crudDVDTestDB".public."comment"
            Where true;
        `);
        await getConnection().query(`
            DELETE
            from "user"
            Where true;
        `);
    });

    describe('createComment', () => {
        const createCommentMut = `
            mutation CreateComment($content: String!, $filmId: Float!, $parentId: String){
                createComment(content: $content, filmId: $filmId, parentId: $parentId){
                    comment_id
                    film_id
                    content
                    user_id
                }
            }
        `;

        type variables = { filmId: number; parentId: string | null; content: string };
        const createComment = async (vars: variables, context: any = {}) =>
            await testGqlCall({
                source: createCommentMut,
                variableValues: vars,
                contextValue: context,
            });

        it('should create comment ', async () => {
            const comment = await createComment(
                { filmId: 1, content: 'this is a new comment', parentId: null },
                {
                    req: { userId: 1 },
                    user: null,
                }
            );
            expect(comment.errors).toBeUndefined();
        });
    });
});
