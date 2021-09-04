import { Arg, Ctx, Field, FieldResolver, InputType, ObjectType, Query, Resolver, Root } from 'type-graphql';
import { Film } from '../entities/Film';
import { Category } from '../entities/Category';
import { getConnection } from 'typeorm';
import { Actor } from '../entities/Actor';
import { Comment } from '../entities/Comment';
import { ContextType, WithLoaders } from '../types/contextType';

@InputType()
class PaginationInput {
    @Field({ nullable: true })
    take?: number;

    @Field({ nullable: true })
    after?: number;
}

@ObjectType()
class PaginatedFilms {
    constructor(films: Film[], pagination: PaginationInput) {
        this.films = films;
        const take = pagination.take || 0;
        const after = pagination.after || 0;
        this.cursor = take + after;
    }
    @Field(() => [Film])
    films: Film[];
    @Field()
    cursor: number;
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

    @Query(() => PaginatedFilms)
    async getFilms(@Arg('pagination') pagination: PaginationInput) {
        const skip = pagination.after === null ? 0 : pagination.after;
        const films =
            pagination.take === null
                ? await Film.find({ skip: skip })
                : await Film.find({ skip: skip, take: pagination.take });
        return new PaginatedFilms(films, pagination);
    }

    @Query(() => Film, { nullable: true })
    async getFilmByTitle(@Arg('title') title: string): Promise<Film | null> {
        const film = await Film.findOne({ title: title });
        if (film) {
            return film;
        } else return null;
    }

    @Query(() => [Film], { nullable: true })
    async getFilmsByCategory(@Arg('categoryName') categoryName: string): Promise<Film[] | null> {
        const category = await Category.findOne({ name: categoryName });
        if (!category) return null;
        return (
            (await getConnection().query(`
                select f.*
                from dvdrental.public.film f,
                     dvdrental.public.film_category fc,
                     dvdrental.public.category c
                where f.film_id = fc.film_id
                  and fc.category_id = ${category.category_id}
                  and fc.category_id = c.category_id
            `)) || null
        );
    }
}

export default FilmResolver;
