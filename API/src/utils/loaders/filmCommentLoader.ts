import DataLoader from 'dataloader';
import { Comment } from '../../entities/Comment';
import { getConnection } from 'typeorm';
import { groupBy } from 'ramda';
import { WithFilmId, WithParentId } from './types';

export const createFilmCommentLoader = () =>
    new DataLoader<number, Comment[]>(async filmIds => {
        const comments: Comment[] = await getConnection().query(
            `
            select c.*
            from comment c 
            where film_id = Any($1)
            `,
            [filmIds]
        );
        const groupedReplies = groupBy(comment => `${comment.film_id}`, comments);
        return filmIds.map(filmId => groupedReplies[`${filmId}`]);
    });
