import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql';
import { Comment } from '../entities/Comment';
import { isAuth } from '../utils/auth/authMiddleWare';
import { ContextType, WithLoaders } from '../types/contextType';
import { Reply } from '../entities/Reply';
import { getConnection } from 'typeorm';
import { injectable } from 'inversify';

@injectable()
@Resolver(() => Comment)
class CommentResolver {
    @FieldResolver(() => [Comment], { nullable: true })
    async replies(@Root() comment: Comment, @Ctx() context: ContextType & WithLoaders) {
        const replyLoader = context.loaders.replyLoader;
        return replyLoader.load(comment.comment_id);
    }

    @FieldResolver(() => String, { nullable: true })
    async short_content(@Root() comment: Comment) {
        return comment.content.substring(0, 15) + '...';
    }

    @UseMiddleware(isAuth)
    @Mutation(() => Comment, { nullable: true })
    async createComment(
        @Ctx() context: ContextType,
        @Arg('content') content: string,
        @Arg('filmId', { nullable: true }) filmId?: number,
        @Arg('parentId', { nullable: true }) parentId?: number
    ): Promise<Comment | null> {
        if (!filmId && !parentId) throw Error('Must include either a filmId or a parentId');
        const userId = context.req.userId || context.user?.id;
        let comment;
        if (filmId != null) {
            comment = await Comment.create({
                film_id: filmId,
                content: content,
                user_id: userId,
                createdAt: new Date(),
                updatedAt: new Date(),
            }).save();
        } else {
            comment = await Comment.create({
                content: content,
                user_id: userId,
                createdAt: new Date(),
                updatedAt: new Date(),
            }).save();
        }

        if (parentId != null) {
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
        const comments: Comment[] = await getConnection().query(
            `
                select c.*
                from dvdrental.public.comment c
                where c.comment_id not in (select r.child_id from dvdrental.public.reply r)
                  and c.film_id = $1
            `,
            [filmId]
        );
        return comments ? comments : null;
    }

    @Query(() => [Comment], { nullable: true })
    async getRepliesOfComment(@Arg('commentId') commentId: number): Promise<Comment[] | null> {
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
