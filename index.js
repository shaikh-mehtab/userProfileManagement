const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
require('colors');

//controller routes
const router = require('./routes/user');





const app = express();

//middleware
app.use(morgan('dev'))
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('upload'));


//route
app.use('/api/user',router);

//port
const port = process.env.PORT;

app.listen(port, () => {
    console.log(`server is running on ${port}`.bgWhite);
});
