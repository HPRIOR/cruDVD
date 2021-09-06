import { Comment } from '../../entities/Comment';
import { Reply } from '../../entities/Reply';

export interface IReplyDAO {
    createCommentChild(parentComment: Comment, childComment: Comment): Promise<Reply>;
}
