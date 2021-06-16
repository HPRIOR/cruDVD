import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { Comment } from '../entities/Comment';
import { isAuth } from '../utils/auth/authMiddleWare';
import { ContextType } from '../types/contextType';
import { Reply } from '../entities/Reply';

@Resolver()
class CommentResolver {
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
}

export default CommentResolver;
