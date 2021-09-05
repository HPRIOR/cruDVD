import { Container } from 'inversify';
import { TYPES } from './types';
import { IFilmDAO } from '../dao/interfaces/IFilmDAO';
import FilmDAO from '../dao/implementation/FilmDAO';
import FilmResolver from '../resolvers/film.resolver';
import CommentResolver from '../resolvers/comment.resolver';
import { UserResolver } from '../resolvers/user.resolver';
import HelloResolver from '../resolvers/hello.resolver';

const container = new Container();
container.bind<IFilmDAO>(TYPES.IFilmDAO).to(FilmDAO);
container.bind<FilmResolver>(FilmResolver).to(FilmResolver).inSingletonScope();
container.bind<CommentResolver>(CommentResolver).to(CommentResolver).inSingletonScope();
container.bind<UserResolver>(UserResolver).to(UserResolver).inSingletonScope();
container.bind<HelloResolver>(HelloResolver).to(HelloResolver).inSingletonScope();
export { container };