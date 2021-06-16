import { Connection, getConnection } from 'typeorm';
import { testDbConnection } from '../test-utils/testDbConnection';
import { testGqlCall } from '../test-utils/testGqlCall';
import { Express } from 'express';
import createExpressApp from '../config/createExpressApp';
import { Comment } from '../entities/Comment';
import { CommentChild } from '../entities/CommentChild';

describe('Comment resolver', () => {
    let dbConn: Connection;
    let express: Express;

    const clearCommentTables = async () => {
        await getConnection().query(`
            DELETE
            from "crudDVDTestDB".public."comment_child"
            Where true;
        `);
        await getConnection().query(`
            DELETE
            from "crudDVDTestDB".public."comment"
            Where true;
        `);
    };
    const clearUserTable = async () => {
        await getConnection().query(`
            DELETE
            from "user"
            Where true;
        `);
    };
    const createTestUser = async () => {
        await getConnection().query(`
            INSERT INTO "crudDVDTestDB".public."user"
            VALUES (1, 'test-user', 'test-user@email.com', '12345asdafFASD£$', 1);
        `);
    };
    beforeAll(async () => {
        dbConn = await testDbConnection();
        express = await createExpressApp();
        await clearCommentTables();
        await clearUserTable();
        await createTestUser();
    });

    afterAll(async () => {
        await clearCommentTables();
        await clearUserTable();
        await dbConn.close();
    });
    afterEach(async () => {
        await clearCommentTables();
    });
    const createCommentMut = `
            mutation CreateComment($content: String!, $filmId: Float!, $parentId: Float){
                createComment(content: $content, filmId: $filmId, parentId: $parentId){
                    comment_id
                    film_id
                    content
                    user_id
                }
            }
        `;

    type variables = { filmId: number; parentId: number | null; content: string };
    const createComment = async (vars: variables, context: any = {}) =>
        await testGqlCall({
            source: createCommentMut,
            variableValues: vars,
            contextValue: context,
        });

    describe('createComment', () => {
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

        it('should throw an error if no user in context', async () => {
            const comment = await createComment(
                { filmId: 1, content: 'this is a new comment', parentId: null },
                {
                    req: {},
                    user: null,
                }
            );
            expect(comment.errors).toBeDefined();
        });
    });

    it('should create comment with correct content', async () => {
        const comment = await createComment(
            { filmId: 1, content: 'this is a new comment', parentId: null },
            {
                req: { userId: 1 },
                user: null,
            }
        );
        console.log(comment.data);
        expect(comment.data?.createComment.content).toBe('this is a new comment');
    });

    it('should create comment with correct userId', async () => {
        const comment = await createComment(
            { filmId: 1, content: 'this is a new comment', parentId: null },
            {
                req: { userId: 1 },
                user: null,
            }
        );
        expect(comment.data?.createComment.user_id).toBe('1');
    });

    it('should create comment with correct film_id', async () => {
        const comment = await createComment(
            { filmId: 1, content: 'this is a new comment', parentId: null },
            {
                req: { userId: 1 },
                user: null,
            }
        );
        expect(comment.data?.createComment.film_id).toBe(1);
    });

    it('should save comment to db', async () => {
        await createComment(
            { filmId: 1, content: 'this is a new comment', parentId: null },
            {
                req: { userId: 1 },
                user: null,
            }
        );
        const comment = await Comment.findOne({ where: { user_id: '1' } });
        expect(comment).toBeDefined();
    });

    it('should create parent comment', async () => {
        await createComment(
            { filmId: 1, content: 'this is a parent comment', parentId: null },
            {
                req: { userId: 1 },
                user: null,
            }
        );

        const parentComment = await Comment.findOne({ where: { content: 'this is a parent comment' } });
        const parentCommentId = parentComment!.comment_id;

        await createComment(
            { filmId: 1, content: 'this is a child comment', parentId: parentCommentId },
            {
                req: { userId: 1 },
                user: null,
            }
        );

        const childCommentInDb = await CommentChild.findOne({ where: { parent_id: parentCommentId } });

        expect(childCommentInDb).toBeDefined();
    });
});
