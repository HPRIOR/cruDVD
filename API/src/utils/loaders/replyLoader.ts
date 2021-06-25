import DataLoader from 'dataloader';
import { Comment } from '../../entities/Comment';
import { getConnection } from 'typeorm';
import { groupBy } from 'ramda';

export type WithParentId = {
    parent_id: number;
};

export const createReplyLoader = () =>
    new DataLoader<number, Comment[]>(async commentIds => {
        console.log('hello');
        const replies = (await getConnection().query(
            `
            select c.*, r.parent_id
            from reply r, comment c
            where r.child_id = c.comment_id
            and r.parent_id = ANY($1)
            `,
            [commentIds]
        )) as (Comment & WithParentId)[];
        const groupedReplies = groupBy(reply => `${reply.parent_id}`, replies);
        return commentIds.map(commentId => groupedReplies[`${commentId}`]);
    });
