import 'reflect-metadata';
import getDbConnection from './app/dbConnection';
import createExpressApp from './app/createExpressApp';
import { Connection } from 'typeorm';

const main = async () => {
    const connection: Connection = await getDbConnection();
    console.log(`Connected to ${connection.driver.database}`);

    const app = await createExpressApp();

    app.listen(4000, () => console.log(`Server ready at http://localhost:${process.env.PORT}/`));
};

main().catch(err => console.error(err));
