import { createConnection } from 'typeorm';

export const testDbConnection = () => {
    return createConnection({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'dvdrental',
        synchronize: false,
        entities: [__dirname + '/../entities/*.*'],
    });
};
