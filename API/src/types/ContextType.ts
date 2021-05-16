import { User } from '../entities/User';

export type ContextType = {
    req: any;
    res: any;
    user: User | null;
};
