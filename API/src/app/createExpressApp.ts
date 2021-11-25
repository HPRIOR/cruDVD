import express from 'express';
import cors from 'cors';
import { __prod__ } from '../constants/constants';
import { ApolloServer } from 'apollo-server-express';
import createSchema from './createSchema';
import cookieParser from 'cookie-parser';
import authoriseContext from '../utils/auth/authoriseContext';
import { createReplyLoader } from '../utils/loaders/replyLoader';
import { createCategoryLoader } from '../utils/loaders/categoryLoader';
import { createActorLoader } from '../utils/loaders/actorLoader';
import { createLanguageLoader } from '../utils/loaders/languageLoader';
import { createFilmCommentLoader } from '../utils/loaders/filmCommentLoader';
import { container } from '../container/container';

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
        schema: await createSchema(container),
        context: ({ req, res }) => ({
            req,
            res,
            loaders: {
                replyLoader: createReplyLoader(),
                categoryLoader: createCategoryLoader(),
                actorLoader: createActorLoader(),
                languageLoader: createLanguageLoader(),
                filmCommentLoader: createFilmCommentLoader(),
            },
        }),
    });

    apolloServer.applyMiddleware({ app, cors: false });

    app.get('/', (_, res) => {
        res.redirect('/graphql');
    });

    console.log(`Running server in mode: ${__prod__ ? 'Prod' : 'Dev'}`);
    return app;
};

export default createExpressApp;
