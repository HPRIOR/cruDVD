import { Connection, getConnection } from 'typeorm';
import { testDbConnection } from '../test-utils/testDbConnection';
import { testGqlCall } from '../test-utils/testGqlCall';
import { create } from 'domain';
import { User } from '../entities/User';

describe('Comment resolver', () => {
    // let dbConn: Connection;
    // beforeAll(async () => {
    //     dbConn = await testDbConnection();
    // });
    // afterAll(async () => {
    //     await dbConn.close();
    // });
    // afterEach(async () => {
    //     await getConnection().query(`
    //     DELETE from dvdrental.public."comment"
    //     Where true;
    //     `);
    // });

    describe('createComment', () => {
        // const createCommentMut = `
        //     mutation CreateComment($content: String!, $filmId: Float!, $parentId: String){
        //         createComment(content: $content, filmId: $filmId, parentId: $parentId){
        //             comment_id
        //             film_id
        //             content
        //             user_id
        //         }
        //     }
        // `;
        // type variable = { filmId: number; parentId: string | null; content: string };
        // const createComment = async (vars: variable, context: any = {}) =>
        //     await testGqlCall({
        //         source: createCommentMut,
        //         variableValues: vars,
        //         contextValue: context,
        //     });

        it('should create comment ', async () => {
            // const comment = await createComment(
            //     { filmId: 1, content: 'this is a new comment', parentId: null },
            //     {
            //         req: { userId: 'user' },
            //         user: new User(),
            //     }
            // );
            // expect(comment.errors).toBeUndefined();
        });
    });
});
