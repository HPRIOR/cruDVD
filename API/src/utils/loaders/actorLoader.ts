import DataLoader from 'dataloader';
import { getConnection } from 'typeorm';
import { groupBy } from 'ramda';
import { Actor } from '../../entities/Actor';
import { WithFilmId } from './types';

export const createActorLoader = () =>
    new DataLoader<number, Actor[]>(async filmIds => {
        const actors: (Actor & WithFilmId)[] = await getConnection().query(
            `
                select a.*, fa.film_id
                from actor a,
                     film_actor fa
                where a.actor_id = fa.actor_id
                  and fa.film_id = ANY ($1)
            `,
            [filmIds]
        );

        const groupedByFilmId = groupBy(actor => `${actor.film_id}`, actors);
        return filmIds.map(id => groupedByFilmId[`${id}`]);
    });
