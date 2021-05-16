import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { __prod__ } from '../constants/constants';
import { ApolloServer } from 'apollo-server-express';
import createSchema from './createSchema';
import cookieParser from 'cookie-parser';
import { ContextType } from '../types/ContextType';
import authoriseContext from '../utils/authoriseContext';

const createExpressApp = async () => {
    const app = express();

    app.set('trust proxy', 1);

    app.use(
        cors({
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        })
    );

    app.use(cookieParser());

    const apolloServer = new ApolloServer({
        schema: await createSchema(),
        context: authoriseContext,
    });

    apolloServer.applyMiddleware({ app, cors: false });

    app.get('/', (_, res) => {
        res.redirect('/graphql');
    });

    console.log(`Running server in mode: ${__prod__ ? 'Prod' : 'Dev'}`);
    return app;
};

export default createExpressApp;
