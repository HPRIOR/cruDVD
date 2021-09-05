import { graphql, GraphQLSchema } from 'graphql';
import createSchema from '../app/createSchema';
import { Maybe } from 'graphql/jsutils/Maybe';
import { Container } from 'inversify';

interface Options {
    source: string;
    variableValues?: Maybe<{
        [key: string]: any;
    }>;
    contextValue?: any;
}

let schema: GraphQLSchema;
export const testGqlCall = async ({ source, variableValues, contextValue }: Options, container?: Container) => {
    if (!schema) {
        schema = await createSchema(container);
    }
    return graphql({
        schema,
        source: source,
        variableValues: variableValues,
        contextValue: contextValue,
    });
};
