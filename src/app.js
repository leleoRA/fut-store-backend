import express from 'express';
import cors from 'cors';
//import bcrypt from 'bcrypt';
//import { v4 as uuid } from 'uuid';
import connection from './database.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/catalog', async (req, res) => {
    const { page } = req.query;
    let querySetting = "";

    try{
        if (!page){
            querySetting = '';
        } else if (page==='Nacional'){
            querySetting = `WHERE category = 'Nacional'`
        } else if (page==='Internacional'){
            querySetting = `WHERE category = 'Internacional'`
        } else{
            return res.sendStatus(501)
        }

        const result = await connection.query(`
            SELECT id, name, "urlImageFront", price 
            FROM products
            ${querySetting}`
        );
        res.send(result.rows)

    } catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});

console.log ("Servidor rodando!");

export default app;