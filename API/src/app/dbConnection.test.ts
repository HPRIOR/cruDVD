import getDbConnection from './dbConnection';
import { Connection } from 'typeorm';

describe('dbConnection', function () {
    let connection: Connection;

    beforeAll(async () => {
        connection = await getDbConnection();
    });

    afterAll(async () => {
        await connection.close();
    });

    it('should start connection with db', async () => {
        expect(connection.isConnected).toBe(true);
    });

    it('should connect to dvd rental', () => {
        expect(connection.driver.database).toBe('dvdrental');
    });
});
