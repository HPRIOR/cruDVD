import { Arg, Ctx, Field, FieldResolver, InputType, ObjectType, Query, Resolver, Root } from 'type-graphql';
import { Film } from '../entities/Film';
import { Category } from '../entities/Category';
import { Actor } from '../entities/Actor';
import { Comment } from '../entities/Comment';
import { Context, WithLoaders } from '../types/context';
import { inject, injectable } from 'inversify';
import { TYPES } from '../container/types';
import { IFilmDAO } from '../dao/interfaces/IFilmDAO';

@InputType()
class PaginationInput {
    @Field({ nullable: true })
    take?: number;

    @Field({ nullable: true })
    after?: number;
}

@ObjectType()
class PaginatedFilms {
    constructor(pagination: PaginationInput, films: Film[] | null) {
        if (films) {
            this.films = films;
        }
        const take = pagination.take || 0;
        const after = pagination.after || 0;
        this.cursor = take + after;
    }

    @Field(() => [Film])
    films: Film[] | null;
    @Field()
    cursor: number;
}

@injectable()
@Resolver(() => Film)
class FilmResolver {
    filmDAO: IFilmDAO;

    constructor(@inject(TYPES.IFilmDAO) filmDAO: IFilmDAO) {
        this.filmDAO = filmDAO;
    }

    @FieldResolver(() => [Comment], { nullable: true })
    async comments(@Root() film: Film, @Ctx() context: Context & WithLoaders) {
        const loader = context.loaders.filmCommentLoader;
        return loader.load(film.film_id);
    }

    @FieldResolver(() => String, { nullable: true })
    async category(@Root() film: Film, @Ctx() context: Context & WithLoaders) {
        const loader = context.loaders.categoryLoader;
        return loader.load(film.film_id);
    }

    @FieldResolver(() => [Actor], { nullable: true })
    async actors(@Root() film: Film, @Ctx() context: Context & WithLoaders) {
        const loader = context.loaders.actorLoader;
        return loader.load(film.film_id);
    }

    @FieldResolver(() => String, { nullable: true })
    async language(@Root() film: Film, @Ctx() context: Context & WithLoaders) {
        const loader = context.loaders.languageLoader;
        return loader.load(film.film_id);
    }

    @Query(() => PaginatedFilms)
    async getFilms(@Arg('pagination') pagination: PaginationInput) {
        const films = await this.filmDAO.getFilms(pagination.after ?? 0, pagination.take);
        return films ? new PaginatedFilms(pagination, films) : new PaginatedFilms(pagination, null);
    }

    @Query(() => Film, { nullable: true })
    async getFilmByTitle(@Arg('title') title: string): Promise<Film | null> {
        const film = await this.filmDAO.getFilmByTitle(title);
        if (film) return film;
        return null;
    }

    @Query(() => PaginatedFilms, { nullable: true })
    async getFilmsByCategory(
        @Arg('categoryName') categoryName: string,
        @Arg('pagination') pagination: PaginationInput
    ) {
        const category = await Category.findOne({ name: categoryName });
        if (!category) return null;

        let films = (await this.filmDAO.getFilmsByCategory(category, pagination.take, pagination.after)) || null;
        return new PaginatedFilms(pagination, films);
    }
}

export default FilmResolver;
