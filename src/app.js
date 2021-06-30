import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
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

app.post('/sign-up', async (req, res) => {
    const { email, password, username } = req.body;
    if (email === '' || password === '' || username === '') {return res.sendStatus(400)}
    const passwordHash = bcrypt.hashSync(password, 10);

    try {
        let emailAvailable = true;
        const checkEmail = await connection.query('SELECT (email) FROM users');
        checkEmail.rows.forEach(i => {
            if (i.email === email) {emailAvailable = false}
        })
        if (!emailAvailable) {return res.sendStatus(409)}

        const createAccount = await connection.query(`
            INSERT INTO users (username, email, password) 
            VALUES ($1, $2, $3)
        `, [username, email, passwordHash]);
        
        res.sendStatus(201);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post('/log-in', async (req, res) => {
    const { email, password } = req.body;
    if (email === '' || password === '') {return res.sendStatus(400)}

    try {
        const pickUser = await connection.query(`
            SELECT * FROM users
            WHERE email = $1
        `,[email]);

        const user = pickUser.rows[0];

        if(user && bcrypt.compareSync(password, user.password)) {
            const token = uuid();
        
            await connection.query(`
                INSERT INTO sessions ("userId", token)
                VALUES ($1, $2)
            `, [user.id, token]);

            res.send({user: user.username, userId: user.id, token: token});
        } else {
            res.sendStatus(403)
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

export default app;