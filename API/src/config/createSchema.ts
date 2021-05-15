import { buildSchema } from 'type-graphql';

const resolverDirectory = __dirname + '/../resolvers/*.resolver.{ts,js}';
const createSchema = () =>
    buildSchema({
        resolvers: [resolverDirectory],
        validate: false,
    });

export default createSchema;
