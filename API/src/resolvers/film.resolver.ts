import { Arg, Field, FieldResolver, ObjectType, Query, Resolver, Root } from 'type-graphql';
import { Film } from '../entities/Film';
import { Category } from '../entities/Category';
import { getConnection } from 'typeorm';
import { Actor } from '../entities/Actor';
import { FilmCategory } from '../entities/FilmCategory';

@ObjectType()
class FilmWithCategory extends Film {
    @Field()
    name: string;
}

@Resolver(() => Film)
class FilmResolver {
    // root object in field resolver is the current object being queried by the resolver - the current film
    @FieldResolver(() => String, { nullable: true })
    async category(@Root() film: Film): Promise<string | null> {
        const category = await getConnection()
            .getRepository(Category)
            .createQueryBuilder('c')
            .leftJoin(FilmCategory, 'fc', 'fc."category_id" = c."category_id"')
            .where('fc."film_id" = :film_id', { film_id: film.film_id })
            .getOne();
        return category?.name || null;
    }

    @FieldResolver(() => [Actor], { nullable: true })
    async actors(@Root() film: Film): Promise<[Actor] | null> {
        const actors = await getConnection().query(`
            select distinct a.first_name, a.last_name, a.last_update
            from actor a,
                 film_actor fa
            where fa.film_id = ${film.film_id}
              and fa.actor_id = a.actor_id
        `);
        return actors || null;
    }

    @FieldResolver(() => String, { nullable: true })
    async language(@Root() film: Film): Promise<String | null> {
        const langauge = await getConnection().query(`
            select distinct l.name
            from language l,
                 film f
            where l.language_id = ${film.language_id}
            LIMIT 1;
        `);
        return langauge[0].name.trim() || null;
    }

    @Query(() => [Film])
    async getAllFilms() {
        return Film.find({});
    }

    @Query(() => Film, { nullable: true })
    async getFilmByTitle(@Arg('title') title: string): Promise<Film | null> {
        const film = await Film.findOne({ title: title });
        if (film) {
            return film;
        } else return null;
    }

    @Query(() => [FilmWithCategory], { nullable: true })
    async getFilmsByCategory(@Arg('categoryName') categoryName: string): Promise<FilmWithCategory[] | null> {
        const category = await Category.findOne({ name: categoryName });
        if (!category) return null;
        return (
            (await getConnection().query(`
                select f.*, c.name
                from film f,
                     film_category fc,
                     category c
                where f.film_id = fc.film_id
                  and fc.category_id = ${category.category_id}
                  and fc.category_id = c.category_id
            `)) || null
        );
    }
}

export default FilmResolver;
