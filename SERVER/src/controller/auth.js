"use strict";
const passwordEncrypt = require("../helper/passwordEncrypt");
const jwt = require("jsonwebtoken");

/* -------------------------------------------------------
    auth controller
------------------------------------------------------- */
// Auth Controller:

const User = require("../models/user");
const Token = require('../models/token');

module.exports = {
  login: async (req, res) => {
        /*
            #swagger.tags = ["Authentication"]
            #swagger.summary = "Login"
            #swagger.description = 'Login with username (or email) and password for get simpleToken and JWT'
            #swagger.parameters["body"] = {
                in: "body",
                required: true,
                schema: {
                    "username": "test",
                    "password": "aA?123456",
                }
            }
        */

        const { username, email, password } = req.body;

        if (!((username || email) && password)) {
            res.errorStatusCode = 401;
            throw new Error("username/email and password are required");
        };

        const user = await User.findOne({ $or: [{ username }, { email }] });

        if (user?.password !== passwordEncrypt(password)) {
            res.errorStatusCode = 401;
            throw new Error("incorrect username/email or password.");
        };

        if (!user.isActive) {
            res.errorStatusCode = 401;
            throw new Error("This account is not active.");
        };

        /* SIMPLE TOKEN */
        let tokenData = await Token.findOne({ userId: user._id });

        if (!tokenData) {
            tokenData = await Token.create({
                userId: user._id,
                token: passwordEncrypt(user._id + Date.now()),
            });
        };
        /* SIMPLE TOKEN */

        /* JWT */
        const accessData = {
            _id: user._id,
            username: user.username,
            email: user.email,
            isActive: user.isActive,
            isAdmin: user.isAdmin,
             isOwner: user.isOwner, 
        };

        const accessToken = jwt.sign(accessData, process.env.ACCESS_KEY, { expiresIn: '1h' })
        const refreshToken = jwt.sign({ _id: user._id, password: user.password }, process.env.REFRESH_KEY, { expiresIn: '3d' })
        /* JWT */

        res.send({
            error: false,
            
            bearer: { accessToken, refreshToken },
            user,
        });
    },

    register: async (req, res) => {
        /*
            #swagger.tags = ["Authentication"]
            #swagger.summary = "Register User"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    "username": "test",
                    "password": "1234",
                    "email": "test@site.com",
                    "firstName": "test",
                    "lastName": "test",
                }
            }
        */


        const { username, email } = req.body;

        const isUserExist = await User.findOne({ $or: [{ username }, { email }] });

        console.log(isUserExist);

        if (isUserExist) {
            res.errorStatusCode = 401;
            throw new Error("Already used username or email.");
        };

        const user = await User.create(req.body);

        /* SIMPLE TOKEN */

        const tokenData = await Token.create({
            userId: user._id,
            token: passwordEncrypt(user._id + Date.now()),
        });
        /* SIMPLE TOKEN */

        /* JWT */
        const accessData = {
            _id: user._id,
            username: user.username,
            email: user.email,
            isActive: user.isActive,
            isAdmin: user.isAdmin,
        };

        const accessToken = jwt.sign(accessData, process.env.ACCESS_KEY, { expiresIn: '30m' })
        const refreshToken = jwt.sign({ _id: user._id, password: user.password }, process.env.REFRESH_KEY, { expiresIn: '3d' })
        /* JWT */

        res.send({
            error: false,
            token: tokenData.token,
            bearer: { accessToken, refreshToken },
            user,
        });
    },

    refresh: async (req, res) => {
        /*
            #swagger.tags = ['Authentication']
            #swagger.summary = 'JWT: Refresh'
            #swagger.description = 'Refresh access-token by refresh-token.'
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    bearer: {
                        refresh: '___refreshToken___'
                    }
                }
            }
        */

        const refreshToken = req.body?.bearer?.refreshToken;

        if (!refreshToken) {
            res.errorStatusCode = 401
            throw new Error('Please enter token.refresh');
        };


        jwt.verify(refreshToken, process.env.REFRESH_KEY, async function (err, userData) {


            if (err) {
                res.errorStatusCode = 401
                throw err
            };

            const { _id, password } = userData

            if (!(_id && password)) {
                res.errorStatusCode = 401
                throw new Error('Not found id or password in token.')
            };

            const user = await User.findOne({ _id });

            if (!(user && user.password == password)) {
                res.errorStatusCode = 401
                throw new Error('Wrong id or password.');
            };

            if (!user.isActive) {
                res.errorStatusCode = 401
                throw new Error('This account is not active.')
            };

            const accessData = {
                _id: user._id,
                username: user.username,
                email: user.email,
                isActive: user.isActive,
                isAdmin: user.isAdmin,
            };
            // JWT:
            const accessToken = jwt.sign(accessData, process.env.ACCESS_KEY, { expiresIn: '30m' });

            res.send({
                error: false,
                bearer: { accessToken }
            })

        })

    },

    logout: async (req, res) => {
        /*
            #swagger.tags = ["Authentication"]
            #swagger.summary = "Token: Logout"
            #swagger.description = 'Delete token-key.'
        */

        const auth = req.headers?.authorization || null // Token ...tokenKey... // Bearer ...accessToken...
        const tokenKey = auth ? auth.split(' ') : null // ['Token', '...tokenKey...'] // ['Bearer', '...accessToken...']

        let message = null, result = {};

        if (tokenKey) {

            if (tokenKey[0] == 'Token') { // SimpleToken

                result = await Token.deleteOne({ token: tokenKey[1] });
                message = 'Token deleted. Logout was OK.'

            } else { // JWT
                message = 'No need any process for logout. You must delete JWT tokens.'
            }
        };

        res.send({
            error: false,
            message,
            result
        })
    },
};
