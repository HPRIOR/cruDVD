import { Film } from '../../entities/Film';
import { Category } from '../../entities/Category';
import { skip, take, title } from '../types';

export interface IFilmDAO {
    getFilms(skip: skip, take?: take): Promise<Film[] | null>;

    getFilmByTitle(title: title): Promise<Film | null>;

    getFilmsByCategory(category: Category): Promise<Film[] | null>;
}
