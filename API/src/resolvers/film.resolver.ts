import { Arg, Query, Resolver } from 'type-graphql';
import { Film } from '../entities/Film';

@Resolver()
class FilmResolver {
  @Query(() => Film, { nullable: true })
  async getFilm(@Arg('title') title: string) {
    const film = await Film.findOne({ title: title });
    if (film) {
      return film;
    } else return null;
  }
}

export default FilmResolver;
