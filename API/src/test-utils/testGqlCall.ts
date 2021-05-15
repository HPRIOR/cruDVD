import { graphql, GraphQLSchema } from 'graphql';
import createSchema from '../config/createSchema';
import { Maybe } from 'graphql/jsutils/Maybe';

interface Options {
    source: string;
    variableValues?: Maybe<{
        [key: string]: any;
    }>;
}

let schema: GraphQLSchema;
export const testGqlCall = async ({ source, variableValues }: Options) => {
    if (!schema) {
        schema = await createSchema();
    }
    return graphql({
        schema,
        source: source,
        variableValues: variableValues,
    });
};
