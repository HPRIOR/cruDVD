import { Connection } from 'typeorm';
import { testGqlCall } from '../test-utils/testGqlCall';
import { testDbConnection } from '../test-utils/testDbConnection';
import { createCategoryLoader } from '../utils/loaders/categoryLoader';
import { createActorLoader } from '../utils/loaders/actorLoader';
import { createLanguageLoader } from '../utils/loaders/languageLoader';
import { Film } from '../entities/Film';

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

        const getFilmDataWithContextLoaders = () =>
            testGqlCall({
                source: getFilmQuery,
                variableValues: { title: 'Aladdin Calendar' },
                contextValue: {
                    loaders: {
                        categoryLoader: createCategoryLoader(),
                        actorLoader: createActorLoader(),
                        languageLoader: createLanguageLoader(),
                    },
                },
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
            const filmData = await getFilmDataWithContextLoaders();
            const category = filmData.data?.getFilmByTitle.category;
            expect(category).toBe('Sports');
        });
        it('should return correct number of actors', async () => {
            const filmData = await getFilmDataWithContextLoaders();
            const actors = filmData.data?.getFilmByTitle.actors;
            expect(actors?.length).toBe(8);
        });
        it('should return correct language', async () => {
            const filmData = await getFilmDataWithContextLoaders();
            const language = filmData.data?.getFilmByTitle.language;
            expect(language).toBe('English');
        });

        describe('getAllFilms', () => {
            const getAllFilmsQuery = `
               query GetFilms($take: Float, $after: Float) 
                {
                    getFilms(pagination: { take: $take, after: $after}) {
                        films {
                            film_id
                            title
                        }
                        cursor
                     }
                }
            `;
            const getPaginatedFilms = (after: number, take?: number) =>
                testGqlCall({
                    source: getAllFilmsQuery,
                    variableValues: { take: take || null, after: after || null },
                });

            it('should get first ten films', async () => {
                const firstTenFilms = await getPaginatedFilms(0, 10);
                let id = 1;
                firstTenFilms.data?.getFilms.films.forEach((film: Film) => {
                    expect(film.film_id).toBe(id.toString());
                    id++;
                });
            });

            it('should return correct cursor value', async () => {
                const firstTenFilms = await getPaginatedFilms(0, 10);
                let cursor = firstTenFilms.data?.getFilms.cursor;
                expect(cursor).toBe(10);
            });
            it('should get next films from after value', async () => {
                const firstTenFilms = await getPaginatedFilms(10, 10);
                let id = 11;
                firstTenFilms.data?.getFilms.films.forEach((film: Film) => {
                    expect(film.film_id).toBe(id.toString());
                    id++;
                });
            });
        });
        describe('getFilmsByCategory', () => {
            const getFilmsByCategory = `
               query GetFilmsByCategory($categoryName: String!, $take: Float, $after: Float) 
                {
                    getFilmsByCategory(categoryName: $categoryName, pagination: { take: $take, after: $after}) {
                        films {
                            film_id
                        }
                        cursor
                     }
                }
            `;
            const getFilmsByCategoryQuery = (categoryName: string, after?: number, take?: number) =>
                testGqlCall({
                    source: getFilmsByCategory,
                    variableValues: { categoryName: categoryName, take: take || null, after: after || null },
                });

            it('should get all action movies', async () => {
                const actionFilms = await getFilmsByCategoryQuery('Action');
                expect(actionFilms.data?.getFilmsByCategory.films.length).toBe(64);
            });

            it('should get 10 action movies', async () => {
                const actionFilms = await getFilmsByCategoryQuery('Action', 0, 10);
                expect(actionFilms.data?.getFilmsByCategory.films.length).toBe(10);
            });
        });
    });
});
