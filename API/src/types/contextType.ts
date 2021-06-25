import { User } from '../entities/User';
import DataLoader from 'dataloader';

export type ContextType = {
    req: any;
    res: any;
    user: User | null;
};

export type WithLoaders = {
    loaders: {
        replyLoader: DataLoader<number, Comment[]>;
    };
};
