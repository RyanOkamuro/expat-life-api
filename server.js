'use strict';

require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');
const { router: usersRouter } = require('./users');
const { router: blogRouter } = require('./blogPosts')

mongoose.Promise = global.Promise;
const {PORT, DATABASE_URL} = require('./config');

const app = express();

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(express.json());
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    if (req.method === 'OPTIONS') {
        return res.send(204);
    }
    next();
});

app.use(passport.initialize());
passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);

const jwtAuth = passport.authenticate('jwt', {session: false});

app.use('/blogPosts/', blogRouter);

app.get('/api/protected', jwtAuth, (req, res) => {
    return res.json({
        data: 'blogDetails'
    });
});

app.use('*', (req, res) => {
    return res.status(404).json({message: 'Not Found'});
});

let server;

function runServer(db = DATABASE_URL, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(db, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                console.log(`Your app is listening on port ${port}`);
                resolve();
            })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

/*
call runServer function if this module is being run by calling node server.js from the command line 
(aka, when we run our app locally or in prod). When we open this file in order to import app and runServer 
in a test module, we do not want the server to automatically run, and this conditional block makes that possible
*/
if (require.main === module) {
    runServer().catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};