import { buildSchema } from 'type-graphql';
import { container } from '../container/container';

const resolverDirectory = __dirname + '/../resolvers/*.resolver.{ts,js}';
const createSchema = () =>
    buildSchema({
        resolvers: [resolverDirectory],
        validate: false,
        container: container,
    });

export default createSchema;
