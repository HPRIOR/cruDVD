import { buildSchema } from 'type-graphql';
import { Container } from 'inversify';

const resolverDirectory = __dirname + '/../resolvers/*.resolver.{ts,js}';
const createSchema = (container?: Container) =>
    container == null
        ? buildSchema({
              resolvers: [resolverDirectory],
              validate: false,
          })
        : buildSchema({
              resolvers: [resolverDirectory],
              validate: false,
              container: container,
          });

export default createSchema;
