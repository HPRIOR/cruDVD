import { Film } from '../../entities/Film';
import { getConnection } from 'typeorm';
import { Category } from '../../entities/Category';
import { IFilmDAO } from '../interfaces/IFilmDAO';
import { skip, take, title } from '../types';
import { injectable } from 'inversify';

@injectable()
class FilmDAO implements IFilmDAO {
    public getFilms = async (skip: skip, take?: take): Promise<Film[] | null> => {
        return take
            ? (await Film.find({ skip: skip, order: { film_id: 'ASC' } })) || null
            : (await Film.find({ skip, take, order: { film_id: 'ASC' } })) || null;
    };
    public getFilmByTitle = async (title: title): Promise<Film | null> =>
        (await Film.findOne({ title: title })) || null;
    public getFilmsByCategory = async (category: Category, take?: take, skip?: skip): Promise<Film[] | null> => {
        return (
            (await getConnection().query(`
                    select f.*
                    from dvdrental.public.film f,
                         dvdrental.public.film_category fc,
                         dvdrental.public.category c
                    where f.film_id = fc.film_id
                      and fc.category_id = ${category.category_id}
                      and fc.category_id = c.category_id
                    order by film_id ASC
                    limit ${take == null ? 'ALL' : take} offset ${skip == null ? 0 : skip}
                     
                `)) || null
        );
    };
}

export default FilmDAO;
