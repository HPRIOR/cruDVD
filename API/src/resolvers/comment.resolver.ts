import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql';
import { Comment } from '../entities/Comment';
import { isAuth } from '../utils/auth/authMiddleWare';
import { Context, WithLoaders } from '../types/context';
import { Reply } from '../entities/Reply';
import { getConnection } from 'typeorm';
import { inject, injectable } from 'inversify';
import { TYPES } from '../container/types';
import { ICommentDAO } from '../dao/interfaces/ICommentDAO';

@injectable()
@Resolver(() => Comment)
class CommentResolver {
    commentDAO: ICommentDAO;

    constructor(@inject(TYPES.ICommentDAO) commentDAO: ICommentDAO) {
        this.commentDAO = commentDAO;
    }

    @FieldResolver(() => [Comment], { nullable: true })
    async replies(@Root() comment: Comment, @Ctx() context: Context & WithLoaders) {
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
        @Ctx() context: Context,
        @Arg('content') content: string,
        @Arg('filmId', { nullable: true }) filmId?: number,
        @Arg('parentId', { nullable: true }) parentId?: number
    ): Promise<Comment | null> {
        if (!filmId && !parentId) throw Error('Must include either a filmId or a parentId');
        let comment = await this.commentDAO.createComment(context, content, filmId);
        if (parentId != null) {
            // TODO: create getCommentsByFilmId in DAO
            const parentComment = await Comment.findOne({ where: { comment_id: parentId } });
            if (parentComment && comment) {
                // TODO create replyDAO with create reply;
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
                where c
                    .comment_id not in (select r.child_id from dvdrental.public.reply r)
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
