import { injectable } from 'inversify';
import { Reply } from '../../entities/Reply';
import { Comment } from '../../entities/Comment';
import { IReplyDAO } from '../interfaces/IReplyDAO';

@injectable()
export class ReplyDAO implements IReplyDAO {
    public async createCommentChild(parentComment: Comment, childComment: Comment): Promise<Reply> {
        const reply = new Reply(parentComment, childComment);
        await reply.save();
        return reply;
    }
}
