import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import connection from './database.js';
import moment from 'moment';

const app = express();
app.use(cors());
app.use(express.json());


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

app.get('/catalog', async (req, res) => {
    const { page } = req.query;
    let querySetting = "";

    try{
        if (!page){
            querySetting = 'ORDER BY team';
        } else if (page==='Nacional'){
            querySetting = `WHERE category = 'Nacional' ORDER BY team`
        } else if (page==='Internacional'){
            querySetting = `WHERE category = 'Internacional' ORDER BY team`
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
    }
});

app.get('/old-orders/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const pickOrders = await connection.query('SELECT * FROM purchases WHERE "userId"=$1', [id]);
        console.log("Requisição feita!");
        res.send(pickOrders.rows);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.get('/products/:id', async (req, res) => {
    const { id } = req.params;

    try{
        const result = await connection.query('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rowCount===0){
            return res.sendStatus(404);
        } else{
            return res.send(result.rows[0]);
        }

    } catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});

app.post('/new-purchase', async (req, res) => {
    const {
        userId,
        products,
        cardName,
        cardNumber,
        expiryDate,
        securityCode
    } = req.body;
    let todayDate = moment().format('DD/MM/YY');
    try {
        const cardNumberRegex = /^[0-9]{16}$/;
        const securityCodeRegex = /^[0-9]{3}$/;
        let validCardNumber = cardNumberRegex.test(cardNumber); //retorna true ou false
        let validSecurityCode = securityCodeRegex.test(securityCode); //retorna true ou false

        if(validCardNumber && validSecurityCode) { 
            products.forEach(async p => {
                await connection.query(`
                    INSERT INTO purchases ("userId", date, product, size, price, "cardNumber", "cardName", "expiryDate", "securityCode")
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `, [userId, todayDate, p.product, p.size, p.price, cardNumber, cardName, expiryDate, securityCode]);
            })
            res.sendStatus(201);
        } else {
            res.sendStatus(403)
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

export default app;