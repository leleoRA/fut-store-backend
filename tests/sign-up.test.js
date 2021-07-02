import app from "../src/app.js";
import connection from '../src/database.js';
import supertest from 'supertest';

describe("POST /sign-up", () => {
    it("returns 201 for valid params", async () => {
        const body = {
          email: 'adriano.test@gmail.com',
          password: '123456',
          username: 'Adriano Test'
        };
        const result = await supertest(app).post("/sign-up").send(body);
        const status = result.status;
        expect(status).toEqual(201);
    });

    it("returns 400 for invalid email", async () => {
        const body = {
            email: '',
            password: '123456',
            username: 'Adriano Test'
        };
        const result = await supertest(app).post("/sign-up").send(body);
        const status = result.status;
        expect(status).toEqual(400);
    });

    it("returns 400 for invalid password", async () => {
        const body = {
            email: 'adriano.test2@gmail.com',
            password: '',
            username: 'Adriano Test2'
        };
        const result = await supertest(app).post("/sign-up").send(body);
        const status = result.status;
        expect(status).toEqual(400);
    });

    it("returns 400 for invalid username", async () => {
        const body = {
            email: 'adriano.test3@gmail.com',
            password: '123456',
            username: ''
        };
        const result = await supertest(app).post("/sign-up").send(body);
        const status = result.status;
        expect(status).toEqual(400);
    });

    it("returns 409 for duplicated email", async () => {
        const body = {
            email: 'adriano.test4@gmail.com',
            password: '123456',
            username: 'Adriano Test4'
        };
        // a primeira inserção vai funcionar
        const firstTry = await supertest(app).post("/sign-up").send(body);
        expect(firstTry.status).toEqual(201);
        // se tentarmos criar um post igual, deve retornar 409
        const secondTry = await supertest(app).post("/sign-up").send(body);
        expect(secondTry.status).toEqual(409);
    });
});

describe("POST /log-in", () => {
    it("returns 400 for invalid email", async () => {
        const body = {
            email: '',
            password: '123456'
        };
        const result = await supertest(app).post("/log-in").send(body);
        const status = result.status;
        expect(status).toEqual(400);
    });

    it("returns 400 for invalid password", async () => {
        const body = {
            email: 'adriano.test@gmail.com',
            password: ''
        };
        const result = await supertest(app).post("/log-in").send(body);
        const status = result.status;
        expect(status).toEqual(400);
    });

    it("returns 403 for wrong password", async () => {
        const body = {
            email: 'adriano.test@gmail.com',
            password: '321987'
        };
        const result = await supertest(app).post("/log-in").send(body);
        const status = result.status;
        expect(status).toEqual(403);
        await connection.query(`DELETE FROM users WHERE username='Adriano Test'`);
        await connection.query(`DELETE FROM users WHERE username='Adriano Test4'`);
    });
});

afterAll(async () => {
    connection.end();
});