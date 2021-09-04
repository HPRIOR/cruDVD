import { createConnection } from 'typeorm';

const getDbConnection = () => createConnection();

export default getDbConnection;
