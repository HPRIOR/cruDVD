import { Arg, Ctx, Field, FieldResolver, ObjectType, Query, Resolver, Root } from 'type-graphql';
import { Film } from '../entities/Film';
import { Category } from '../entities/Category';
import { getConnection } from 'typeorm';
import { Actor } from '../entities/Actor';
import { Comment } from '../entities/Comment';
import { ContextType, WithLoaders } from '../types/contextType';

@ObjectType()
class FilmWithCategory extends Film {
    @Field()
    name: string;
}

@Resolver(() => Film)
class FilmResolver {
    @FieldResolver(() => [Comment], { nullable: true })
    async comments(@Root() film: Film, @Ctx() context: ContextType & WithLoaders) {
        const loader = context.loaders.filmCommentLoader;
        return loader.load(film.film_id);
    }

    @FieldResolver(() => String, { nullable: true })
    async category(@Root() film: Film, @Ctx() context: ContextType & WithLoaders) {
        const loader = context.loaders.categoryLoader;
        return loader.load(film.film_id);
    }

    @FieldResolver(() => [Actor], { nullable: true })
    async actors(@Root() film: Film, @Ctx() context: ContextType & WithLoaders) {
        const loader = context.loaders.actorLoader;
        return loader.load(film.film_id);
    }

    @FieldResolver(() => String, { nullable: true })
    async language(@Root() film: Film, @Ctx() context: ContextType & WithLoaders) {
        const loader = context.loaders.languageLoader;
        return loader.load(film.film_id);
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
