import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql';
import { Comment } from '../entities/Comment';
import { isAuth } from '../utils/auth/authMiddleWare';
import { ContextType } from '../types/contextType';
import { Reply } from '../entities/Reply';
import { getConnection } from 'typeorm';

@Resolver(() => Comment)
class CommentResolver {
    @FieldResolver(() => [Comment], { nullable: true })
    async children(@Root() comment: Comment): Promise<Comment[] | null> {
        const children = await getConnection()
            .getRepository(Comment)
            .createQueryBuilder('c')
            .leftJoin(Reply, 'r', 'c."comment_id" = r."child_id"')
            .where('r."parent_id" = :comment_id', { comment_id: comment.comment_id })
            .getMany();
        return children || null;
    }

    @UseMiddleware(isAuth)
    @Mutation(() => Comment, { nullable: true })
    async createComment(
        @Ctx() context: ContextType,
        @Arg('content') content: string,
        @Arg('filmId') filmId: number,
        @Arg('parentId', { nullable: true }) parentId: number
    ): Promise<Comment | null> {
        const userId = context.req.userId || context.user?.id;
        const comment = await Comment.create({
            film_id: filmId,
            content: content,
            user_id: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).save();

        if (parentId) {
            const parentComment = await Comment.findOne({ where: { comment_id: parentId } });
            if (parentComment) {
                const commentChild = new Reply(parentComment, comment);
                await commentChild.save();
            }
        }
        return comment || null;
    }

    @Query(() => [Comment], { nullable: true })
    async getCommentsByFilmId(@Arg('filmId') filmId: number): Promise<Comment[] | null> {
        const comments = await Comment.find({ where: { film_id: filmId } });
        return comments ? comments : null;
    }

    @Query(() => [Comment], { nullable: true })
    async getChildrenOfComment(@Arg('commentId') commentId: number): Promise<Comment[] | null> {
        const children = await getConnection()
            .getRepository(Comment)
            .createQueryBuilder('c')
            .leftJoin(Reply, 'r', 'c."comment_id" = r."child_id"')
            .where('r."parent_id" = :comment_id', { comment_id: commentId })
            .getMany();

        return children || null;
    }
}

export default CommentResolver;
