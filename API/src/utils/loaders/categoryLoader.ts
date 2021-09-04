import DataLoader from 'dataloader';
import { Category } from '../../entities/Category';
import { getConnection } from 'typeorm';
import { groupBy } from 'ramda';
import { WithFilmId } from './types';

export const createCategoryLoader = () =>
    new DataLoader<number, string>(async filmIds => {
        const categories: (Category & WithFilmId)[] = await getConnection().query(
            `
            select c.name, fc.film_id
            from dvdrental.public.category c, dvdrental.public.film_category fc
            where c.category_id = fc.category_id
            and fc.film_id = ANY($1)
            `,
            [filmIds]
        );

        const groupedByFilmIds = groupBy(category => `${category.film_id}`, categories);
        return filmIds.map(id => groupedByFilmIds[`${id}`].map(c => c.name)).map(c => c[0]);
    });
