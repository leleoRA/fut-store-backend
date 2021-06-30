import app from "../src/app.js";
import connection from '../src/database.js';
import supertest from 'supertest';

afterAll(() => {
    connection.end();
});

describe('GET /catalog', () => {

    it ('returns status 501 if query param is invalid', async () =>{

        const result = await supertest(app).get('/catalog').query({ page: 'Nation'})

        expect(result.status).toEqual(501)
    })
})