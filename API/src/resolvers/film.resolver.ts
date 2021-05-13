import { Arg, Field, ObjectType, Query, Resolver } from 'type-graphql';
import { Film } from '../entities/Film';
import { Category } from '../entities/Category';
import { getConnection } from 'typeorm';

@ObjectType()
class FilmWithCategory extends Film {
  @Field()
  name: string;
}

@Resolver()
class FilmResolver {
  @Query(() => Film, { nullable: true })
  async getFilm(@Arg('title') title: string): Promise<Film | null> {
    const film = await Film.findOne({ title: title });
    if (film) {
      return film;
    } else return null;
  }

  @Query(() => [FilmWithCategory], { nullable: true })
  async getFilmByCategory(@Arg('categoryName') categoryName: string): Promise<FilmWithCategory[] | null> {
    const category = await Category.findOne({ name: categoryName });
    if (!category) return null;
    const result =
      (await getConnection().query(`
      select f.*, c.name
      from film f, film_category fc, category c  
      where f.film_id = fc.film_id 
        and fc.category_id = ${category.category_id}
        and fc.category_id = c.category_id
    `)) || null;
    console.log(result);
    return result;
  }
}

export default FilmResolver;
