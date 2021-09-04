import { Film } from '../../entities/Film';
import { getConnection } from 'typeorm';
import { Category } from '../../entities/Category';
import { IFilmDAO } from '../interfaces/IFilmDAO';
import { skip, take, title } from '../types';

class FilmDAO implements IFilmDAO {
    public getFilms = async (skip: skip, take?: take): Promise<Film[] | null> => {
        return take ? (await Film.find({ skip })) || null : (await Film.find({ skip, take })) || null;
    };
    public getFilmByTitle = async (title: title): Promise<Film | null> =>
        (await Film.findOne({ title: title })) || null;
    public getFilmsByCategory = async (category: Category): Promise<Film[] | null> =>
        (await getConnection().query(`
            select f.*
            from dvdrental.public.film f,
                 dvdrental.public.film_category fc,
                 dvdrental.public.category c
            where f.film_id = fc.film_id
              and fc.category_id = ${category.category_id}
              and fc.category_id = c.category_id
        `)) || null;
}

export default FilmDAO;
