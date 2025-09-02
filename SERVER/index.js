const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const HOST = process.env?.HOST || '127.0.0.1'
const PORT = process.env.PORT || 3000;

// asyncErrors to errorHandler:
require('express-async-errors')

// Query Handler:
app.use(require('./src/middleware/queryHandler'))

// Connect to DB:
const { dbConnection } = require('./src/config/dbConnection')
dbConnection()

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(require('./src/middleware/authentication'));

// HomePath:
app.all('/', (req, res) => {
    res.send({
        error: false,
        message: 'Welcome to My Project',
        documents: {
            swagger: '/documents/swagger',
            redoc: '/documents/redoc',
            json: '/documents/json',
        },
        user: req.user
    })
});

// Routes:
app.use(require('./src/routes'));

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 dakika
//   max: 100 // IP başına maksimum 100 istek
// });
// app.use('/api', limiter);

// errorHandler:
app.use(require('./src/middleware/errorHnadler'))

// RUN SERVER:
app.listen(PORT, HOST, () => console.log(`http://${HOST}:${PORT}`))

// Syncronization (must be in commentLine):
/require('./src/helper/sync')() // !!! It clear database.
