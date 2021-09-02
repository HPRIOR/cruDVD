import DataLoader from 'dataloader';
import { Comment } from '../../entities/Comment';
import { getConnection } from 'typeorm';
import { groupBy } from 'ramda';
import { WithParentId } from './types';

export const createReplyLoader = () =>
    new DataLoader<number, Comment[]>(async commentIds => {
        const replies: (Comment & WithParentId)[] = await getConnection().query(
            `
                select c.*, r.parent_id
                from reply r,
                     comment c
                where r.child_id = c.comment_id
                  and r.parent_id = ANY ($1)
            `,
            [commentIds]
        );
        const groupedReplies = groupBy(reply => `${reply.parent_id}`, replies);
        return commentIds.map(commentId => groupedReplies[`${commentId}`]);
    });
