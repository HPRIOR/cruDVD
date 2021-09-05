import { ICommentDAO } from '../interfaces/ICommentDAO';
import { Comment } from '../../entities/Comment';
import { Context } from '../../types/context';
import { injectable } from 'inversify';

@injectable()
export class CommentDAO implements ICommentDAO {
    public async createComment(context: Context, content: string, filmId?: number): Promise<Comment | null> {
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
        return comment || null;
    }

    public getCommentsByFilmId(filmId: number): Promise<Comment | null> {
        console.log(filmId);
        return Promise.resolve(new Comment());
    }

    public getRepliesOfComment(commentId: number): Promise<Comment | null> {
        console.log(commentId);
        return Promise.resolve(new Comment());
    }

    public findCommentByCommentId(comment_id: string): Promise<Comment | null> {
        console.log(comment_id);
        return Promise.resolve(new Comment());
    }
}
