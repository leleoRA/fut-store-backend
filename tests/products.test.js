import app from "../src/app.js";
import connection from '../src/database.js';
import supertest from 'supertest';

describe('GET /products/:id', () => {

    it ('returns status 404 if product ID is invalid or inexistent', async () =>{

        const result = await supertest(app).get('/products/0')

        expect(result.status).toEqual(404)
    })
});

afterAll(() => {
    connection.end();
});