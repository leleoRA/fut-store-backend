import app from "../src/app.js";
import connection from '../src/database.js';
import supertest from 'supertest';

describe("POST /new-purchase", () => {
    it("returns 201 for valid params", async () => {
        const body = {
            userId: 300,
            products: [{
                img: "https://varotti.vteximg.com.br/arquivos/ids/172906-1000-1000/36562_MDF-Vermelho-Scarlate-Lacca-AD-Eucatex_6mm.jpg?v=637152138083630000",
                price: 239.90,
                product: "Camisa 2 Mirassol",
                size: "M"
            }],
            cardName: "Nome cartão teste",
            cardNumber: 1111222233334444,
            expiryDate: "04/25",
            securityCode: 555
        };
        const result = await supertest(app).post("/new-purchase").send(body);
        const status = result.status;
        expect(status).toEqual(201);
        await connection.query(`DELETE FROM purchases WHERE "userId"='300'`);
    });
});

afterAll(async () => {
    connection.end();
});