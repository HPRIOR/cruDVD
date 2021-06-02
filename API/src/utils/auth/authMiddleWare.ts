import { MiddlewareFn } from 'type-graphql';
import { ContextType } from '../../types/contextType';

export const isAuth: MiddlewareFn<ContextType> = ({ context }, next) => {
    if (!context.req.userId && !context.user) {
        throw new Error('not authenticated');
    }

    return next();
};
