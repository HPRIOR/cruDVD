import { Connection } from 'typeorm';
import { testGqlCall } from '../test-utils/testGqlCall';
import { testDbConnection } from '../test-utils/testDbConnection';

describe('filmResolver', function () {
    let dbConn: Connection;
    beforeAll(async () => {
        dbConn = await testDbConnection();
    });
    afterAll(async () => {
        await dbConn.close();
    });

    describe('getFilmByTitle', () => {
        const getFilmQuery = `
            query GetFilm($title: String!){
              getFilmByTitle(title: $title){
              film_id
              title
              fulltext
              special_features
              rating
              replacement_cost
              length
              rental_rate
              rental_duration
              language_id
              release_year
              description
              category
              actors{
                first_name
                last_name
              }
              language
            }
          }

          `;

        const getFilmData = () =>
            testGqlCall({
                source: getFilmQuery,
                variableValues: { title: 'Aladdin Calendar' },
            });

        it('should return data', async () => {
            const filmData = await getFilmData();
            expect(filmData.data).toBeDefined();
        });

        it('should return correct title data', async () => {
            const filmData = await getFilmData();
            const title = filmData.data?.getFilmByTitle.title;
            expect(title).toBe('Aladdin Calendar');
        });
        it('should return correct id data', async () => {
            const filmData = await getFilmData();
            const title = filmData.data?.getFilmByTitle.film_id;
            expect(title).toBe('10');
        });
        it('should return correct release_year data', async () => {
            const filmData = await getFilmData();
            const title = filmData.data?.getFilmByTitle.release_year;
            expect(title).toBe('2006');
        });
        it('should return correct category data', async () => {
            const filmData = await getFilmData();
            const category = filmData.data?.getFilmByTitle.category;
            expect(category).toBe('Sports');
        });
        it('should return correct number of actors', async () => {
            const filmData = await getFilmData();
            const actors = filmData.data?.getFilmByTitle.actors;
            expect(actors?.length).toBe(8);
        });
        it('should return correct language', async () => {
            const filmData = await getFilmData();
            const language = filmData.data?.getFilmByTitle.language;
            expect(language).toBe('English');
        });
    });
});
