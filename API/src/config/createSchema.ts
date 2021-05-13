import { buildSchema } from 'type-graphql';
import HelloResolver from '../resolvers/hello.resolver';
import FilmResolver from '../resolvers/film.resolver';

const resolverDirectory = __dirname + '/../resolvers/*.resolver.{ts,js}';
const createSchema = () =>
  buildSchema({
    resolvers: [resolverDirectory],
    validate: false,
  });

export default createSchema;
