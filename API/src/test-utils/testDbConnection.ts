import { createConnection } from 'typeorm';

export const testDbConnection = () => {
    return createConnection({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'docker',
        database: 'dvdrental',
        synchronize: true,
        entities: [__dirname + '/../entities/*.*'],
    });
};
