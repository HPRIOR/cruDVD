import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { Comment } from '../entities/Comment';
import { v4 as uuid } from 'uuid';
import { isAuth } from '../utils/auth/authMiddleWare';
import { ContextType } from '../types/contextType';

@Resolver()
class CommentResolver {
    @UseMiddleware(isAuth)
    @Mutation(() => Comment, { nullable: true })
    async createComment(
        @Ctx() context: ContextType,
        @Arg('content') content: string,
        @Arg('filmId') filmId: number,
        @Arg('parentId', { nullable: true }) parentId: string
    ): Promise<Comment | null> {
        const userId = context.req.userId || context.user?.id;
        if (parentId) {
        }
        const comment = await Comment.create({
            comment_id: uuid(),
            film_id: filmId,
            content: content,
            user_id: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).save();
        return comment || null;
    }
}

export default CommentResolver;
