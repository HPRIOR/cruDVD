import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql';
import { Comment } from '../entities/Comment';
import { isAuth } from '../utils/auth/authMiddleWare';
import { Context, WithLoaders } from '../types/context';
import { inject, injectable } from 'inversify';
import { TYPES } from '../container/types';
import { ICommentDAO } from '../dao/interfaces/ICommentDAO';
import { IReplyDAO } from '../dao/interfaces/IReplyDAO';

@injectable()
@Resolver(() => Comment)
class CommentResolver {
    private commentDAO: ICommentDAO;
    private replyDAO: IReplyDAO;

    constructor(@inject(TYPES.ICommentDAO) commentDAO: ICommentDAO, @inject(TYPES.IReplyDAO) replyDAO: IReplyDAO) {
        this.commentDAO = commentDAO;
        this.replyDAO = replyDAO;
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
        // TODO use exclusive or
        if ((!filmId && !parentId) || (filmId && parentId)) throw Error('Must include either a filmId or a parentId');
        let comment = await this.commentDAO.createComment(context, content, filmId);

        const isReplyOfAnotherComment = parentId != null;
        if (isReplyOfAnotherComment) await this.createReply(parentId!, comment);

        return comment || null;
    }

    async createReply(parentId: number, thisComment: Comment | null) {
        const parentComment = await this.commentDAO.findCommentByCommentId(parentId);
        if (parentComment && thisComment) {
            await this.replyDAO.createCommentChild(parentComment, thisComment);
        }
    }

    @Query(() => [Comment], { nullable: true })
    async getCommentsByFilmId(@Arg('filmId') filmId: number): Promise<Comment[] | null> {
        return await this.commentDAO.getCommentsByFilmId(filmId);
    }

    @Query(() => [Comment], { nullable: true })
    async getRepliesOfComment(@Arg('commentId') commentId: number): Promise<Comment[] | null> {
        return await this.commentDAO.getRepliesOfComment(commentId);
    }
}

export default CommentResolver;
