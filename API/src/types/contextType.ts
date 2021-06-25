import { User } from '../entities/User';
import DataLoader from 'dataloader';
import { Actor } from '../entities/Actor';

export type ContextType = {
    req: any;
    res: any;
    user: User | null;
};

export type WithLoaders = {
    loaders: {
        replyLoader: DataLoader<number, Comment[]>;
        categoryLoader: DataLoader<number, string[]>;
        actorLoader: DataLoader<number, Actor[]>;
    };
};
