import { graphql, GraphQLSchema } from 'graphql';
import createSchema from '../app/createSchema';
import { Maybe } from 'graphql/jsutils/Maybe';

interface Options {
    source: string;
    variableValues?: Maybe<{
        [key: string]: any;
    }>;
    contextValue?: any;
}

let schema: GraphQLSchema;
export const testGqlCall = async ({ source, variableValues, contextValue }: Options) => {
    if (!schema) {
        schema = await createSchema();
    }
    return graphql({
        schema,
        source: source,
        variableValues: variableValues,
        contextValue: contextValue,
    });
};
