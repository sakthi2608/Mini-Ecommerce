const express = require('express');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

const connectDatabase = require('./config/connectDatabase');

dotenv.config({
    path: path.join(__dirname, 'config', 'config.env')
});

const products = require('./routes/product');
const orders = require('./routes/order');
const users = require('./routes/user');
const wishlist = require('./routes/wishlist');

connectDatabase();

app.use(cors());
app.use(express.json());

app.use('/api/v1/', products);
app.use('/api/v1/', orders);
app.use('/api/v1/', users);
app.use('/api/v1/', wishlist);

app.listen(process.env.PORT, () => {
    console.log(
        `Server listening to port ${process.env.PORT} in ${process.env.NODE_ENV}`
    );
});