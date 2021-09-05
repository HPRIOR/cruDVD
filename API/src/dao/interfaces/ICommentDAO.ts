import { Comment } from '../../entities/Comment';
import { Context } from '../../types/context';

export interface ICommentDAO {
    createComment(context: Context, content: string, filmId?: number): Promise<Comment | null>;

    findCommentByCommentId(comment_id: string): Promise<Comment | null>;

    getCommentsByFilmId(filmId: number): Promise<Comment | null>;

    getRepliesOfComment(commentId: number): Promise<Comment | null>;
}
