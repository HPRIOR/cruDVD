import { MiddlewareFn } from 'type-graphql';
import { Context } from '../../types/context';

export const isAuth: MiddlewareFn<Context> = ({ context }, next) => {
    if (!context.req.userId && !context.user) {
        throw new Error('not authenticated');
    }

    return next();
};
