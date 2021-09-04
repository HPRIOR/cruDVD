import { Connection, getConnection } from 'typeorm';
import { testDbConnection } from '../test-utils/testDbConnection';
import { testGqlCall } from '../test-utils/testGqlCall';
import { Express } from 'express';
import createExpressApp from '../app/createExpressApp';
import { Comment } from '../entities/Comment';
import { Reply } from '../entities/Reply';
import { createReplyLoader } from '../utils/loaders/replyLoader';

describe('Comment resolver', () => {
    let dbConn: Connection;
    let express: Express;

    const clearCommentTables = async () => {
        await getConnection().query(`
            DELETE
            from dvdrental.public."reply"
            Where true;
        `);
        await getConnection().query(`
            DELETE
            from dvdrental.public."comment"
            Where true;
        `);
    };
    const clearUserTable = async () => {
        await getConnection().query(`
            DELETE
            from dvdrental.public."user"
            Where true;
        `);
    };
    const createTestUser = async () => {
        await getConnection().query(`
            INSERT INTO dvdrental.public."user"
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
    const getCommentByFilmIdQuery = `
             query GetCommentsByFilmId($filmId: Float!){
                getCommentsByFilmId(filmId: $filmId){
                    comment_id
                    film_id
                    content
                    user_id
                }
            }
        `;

    const getCommentByFilmIdQueryWithChild = `
             query GetCommentsByFilmId($filmId: Float!){
                getCommentsByFilmId(filmId: $filmId){
                    comment_id
                    film_id
                    content
                    user_id
                    replies{
                        comment_id
                        content
                        user_id
                    }
                }
            }
        `;

    const getRepliesOfCommentQuery = `
             query GetRepliesOfCommentQuery($commentId: Float!){
                getRepliesOfComment(commentId: $commentId){
                    comment_id
                    film_id
                    content
                    user_id
                }
            }
        `;

    type createCommentVariables = { filmId: number; parentId: number | null; content: string };
    const createComment = async (vars: createCommentVariables, context: any = {}) =>
        await testGqlCall({
            source: createCommentMut,
            variableValues: vars,
            contextValue: context,
        });

    type getCommentByFilmIdVariables = { filmId: number };
    const getCommentByFilmId = async (vars: getCommentByFilmIdVariables, context: any = {}) =>
        await testGqlCall({
            source: getCommentByFilmIdQuery,
            variableValues: vars,
            contextValue: context,
        });

    type getChildrenOfComment = { commentId: number };
    const getChildrenOfComment = async (vars: getChildrenOfComment, context: any = {}) =>
        await testGqlCall({
            source: getRepliesOfCommentQuery,
            variableValues: vars,
            contextValue: context,
        });

    const getCommentByFilmIdWithChildren = async (vars: getCommentByFilmIdVariables, context: any = {}) =>
        await testGqlCall({
            source: getCommentByFilmIdQueryWithChild,
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

        const childCommentInDb = await Reply.findOne({ where: { parent_id: parentCommentId } });

        expect(childCommentInDb).toBeDefined();
    });

    it('should be able to create two child comments on one parent', async () => {
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
        await createComment(
            { filmId: 1, content: 'this is another child comment', parentId: parentCommentId },
            {
                req: { userId: 1 },
                user: null,
            }
        );

        const childCommentInDb = await Reply.find({ where: { parent_id: parentCommentId } });

        expect(childCommentInDb.length).toBe(2);
    });

    describe('getCommentsByFilmID', () => {
        it('should get comments by film ID', async () => {
            await createComment(
                { filmId: 1, content: 'this is a child comment', parentId: null },
                {
                    req: { userId: 1 },
                    user: null,
                }
            );
            let comments = await getCommentByFilmId({ filmId: 1 });
            expect(comments.data?.getCommentsByFilmId.length).toBe(1);
        });

        it('should get children of comment', async () => {
            await createComment(
                { filmId: 1, content: 'this is a parent comment', parentId: null },
                {
                    req: { userId: 1 },
                    user: null,
                }
            );

            await createComment(
                { filmId: 1, content: 'this is another parent comment', parentId: null },
                {
                    req: { userId: 1 },
                    user: null,
                }
            );

            const parentComment = await Comment.findOne({ where: { content: 'this is a parent comment' } });
            const parentCommentId = parentComment!.comment_id;

            const parentCommentAlt = await Comment.findOne({ where: { content: 'this is another parent comment' } });
            const parentCommentAltId = parentCommentAlt!.comment_id;

            await createComment(
                { filmId: 1, content: 'this is a child comment', parentId: parentCommentId },
                {
                    req: { userId: 1 },
                    user: null,
                }
            );
            await createComment(
                { filmId: 1, content: 'this is another child comment', parentId: parentCommentId },
                {
                    req: { userId: 1 },
                    user: null,
                }
            );

            await createComment(
                { filmId: 1, content: 'this is a child comment of alt parent comment', parentId: parentCommentAltId },
                {
                    req: { userId: 1 },
                    user: null,
                }
            );
            let comments = await getCommentByFilmIdWithChildren(
                { filmId: 1 },
                { loaders: { replyLoader: createReplyLoader() } }
            );

            expect(comments.data?.getCommentsByFilmId[0].replies.length).toBe(2);
            expect(comments.data?.getCommentsByFilmId[0].replies[0].content).toBe('this is a child comment');
            expect(comments.data?.getCommentsByFilmId[0].replies[1].content).toBe('this is another child comment');
        });

        it('should only get top level film ids without child comments', async () => {
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

            const comments = await getCommentByFilmId({ filmId: 1 });
            expect(comments.data?.getCommentsByFilmId.length).toBe(1);
            expect(comments.data?.getCommentsByFilmId[0].content).toBe('this is a parent comment');
        });
    });

    describe('getChildrenOfComment', () => {
        it('should get children of comment', async () => {
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
            const children = await getChildrenOfComment({ commentId: parentCommentId });
            expect(children.data?.getRepliesOfComment.length).toBe(1);
        });
    });

    describe('getCommentsByFilmId', () => {});
});
