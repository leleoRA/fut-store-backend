import app from "../src/app.js";
import connection from '../src/database.js';
import supertest from 'supertest';

describe("POST /sign-up", () => {
    it("returns 201 for valid params", async () => {
        // TESTE PARA SUCESSO
    });

    it("returns 400 for invalid email", async () => {
        // TESTE PARA EMAIL INCORRETO
    });

    it("returns 400 for invalid password", async () => {
        // TESTE PARA SENHA INCORRETA
    });

    it("returns 400 for invalid username", async () => {
        // TESTE PARA NOME DE USUÁRIO INVÁLIDO
    });

    it("returns 409 for duplicated email", async () => {
        // TESTE PARA EMAIL JÁ EM USO
    });
});

afterAll(async () => {
    connection.end();
});