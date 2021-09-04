import DataLoader from 'dataloader';
import { getConnection } from 'typeorm';
import { groupBy } from 'ramda';
import { WithFilmId } from './types';
import { Language } from '../../entities/Language';

export const createLanguageLoader = () =>
    new DataLoader<number, string>(async filmIds => {
        const languages: (Language & WithFilmId)[] = await getConnection().query(
            `
            select l.name, f.film_id
            from dvdrental.public.language l,  dvdrental.public.film f
            where l.language_id = f.language_id
            and f.film_id = ANY($1)
            `,
            [filmIds]
        );

        const groupedByFilmIds = groupBy(language => `${language.film_id}`, languages);
        return filmIds.map(id => groupedByFilmIds[`${id}`].map(l => l.name)).map(c => c[0].trim());
    });
