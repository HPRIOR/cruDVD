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

  describe('getFilm', () => {
    const getFilmQuery = `
    query GetFilm($title: String!){
      getFilm(title: $title){
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
      const title = filmData.data?.getFilm.title;
      expect(title).toBe('Aladdin Calendar');
    });
    it('should return correct id data', async () => {
      const filmData = await getFilmData();
      const title = filmData.data?.getFilm.film_id;
      expect(title).toBe('10');
    });
    it('should return correct release_year data', async () => {
      const filmData = await getFilmData();
      const title = filmData.data?.getFilm.release_year;
      expect(title).toBe('2006');
    });
  });
});
