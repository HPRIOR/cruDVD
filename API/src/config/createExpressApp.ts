import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { __prod__ } from '../constants/constants';
import { ApolloServer } from 'apollo-server-express';
import createSchema from './createSchema';
import cookieParser from 'cookie-parser';
import authoriseContext from '../utils/auth/authoriseContext';

const createExpressApp = async () => {
    const app = express();

    app.set('trust proxy', 1);

    app.use(cookieParser());
    app.use(
        cors({
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        })
    );

    app.use((req, res, next) => {
        authoriseContext({ req, res });
        next();
    });

    const apolloServer = new ApolloServer({
        schema: await createSchema(),
        context: ({ req, res }: any) => ({ req, res }),
    });

    apolloServer.applyMiddleware({ app, cors: false });

    app.get('/', (_, res) => {
        res.redirect('/graphql');
    });

    console.log(`Running server in mode: ${__prod__ ? 'Prod' : 'Dev'}`);
    return app;
};

export default createExpressApp;
