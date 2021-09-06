import { ICommentDAO } from '../interfaces/ICommentDAO';
import { Comment } from '../../entities/Comment';
import { Context } from '../../types/context';
import { injectable } from 'inversify';
import { getConnection } from 'typeorm';
import { Reply } from '../../entities/Reply';

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

    public async getCommentsByFilmId(filmId: number): Promise<Comment[] | null> {
        return (
            (await getConnection().query(
                `
                select c.*
                from dvdrental.public.comment c
                where c .comment_id not in (select r.child_id from dvdrental.public.reply r)
                  and c.film_id = $1
            `,
                [filmId]
            )) || null
        );
    }

    public async getRepliesOfComment(commentId: number): Promise<Comment[] | null> {
        return (
            (await getConnection()
                .getRepository(Comment)
                .createQueryBuilder('c')
                .leftJoin(Reply, 'r', 'c."comment_id" = r."child_id"')
                .where('r."parent_id" = :comment_id', { comment_id: commentId })
                .getMany()) || null
        );
    }

    public async findCommentByCommentId(comment_id: number): Promise<Comment | null> {
        return (await Comment.findOne({ where: { comment_id: comment_id } })) || null;
    }
}
