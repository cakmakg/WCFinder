"use strict";
const passwordEncrypt = require("../helper/passwordEncrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Token = require('../models/token');

module.exports = {
  login: async (req, res) => {
        const { username, email, password } = req.body;

        if (!((username || email) && password)) {
            res.errorStatusCode = 401;
            throw new Error("username/email and password are required");
        }

        const user = await User.findOne({ $or: [{ username }, { email }] });

        if (!user) {
            res.errorStatusCode = 401;
            throw new Error("incorrect username/email or password.");
        }

        const encryptedPassword = passwordEncrypt(password);
        
        if (user.password !== encryptedPassword) {
            res.errorStatusCode = 401;
            throw new Error("incorrect username/email or password.");
        }

        if (!user.isActive) {
            res.errorStatusCode = 401;
            throw new Error("This account is not active.");
        }

        let tokenData = await Token.findOne({ userId: user._id });

        if (!tokenData) {
            tokenData = await Token.create({
                userId: user._id,
                token: passwordEncrypt(user._id + Date.now()),
            });
        }

        const accessData = {
            _id: user._id,
            username: user.username,
            email: user.email,
            isActive: user.isActive,
            role: user.role,
        };

        const accessToken = jwt.sign(accessData, process.env.ACCESS_KEY, { expiresIn: '1h' })
        const refreshToken = jwt.sign({ _id: user._id, password: user.password }, process.env.REFRESH_KEY, { expiresIn: '3d' })

        res.send({
            error: false,
            bearer: { accessToken, refreshToken },
            user,
        });
    },

    register: async (req, res) => {
        const { username, email, password } = req.body;

        const isUserExist = await User.findOne({ $or: [{ username }, { email }] });

        if (isUserExist) {
            res.errorStatusCode = 409;
            throw new Error("Already used username or email.");
        }

        // ✅ CRITICAL FIX: Şifreyi MANUEL hash'le
        const userData = { ...req.body };
        userData.password = passwordEncrypt(password);
        
        // ✅ GÜVENLİK: Register sırasında sadece 'user' role'ü ile kayıt olabilsin
        // Owner ve admin rolleri sadece admin tarafından atanabilir
        userData.role = 'user';

        const user = await User.create(userData);

        const tokenData = await Token.create({
            userId: user._id,
            token: passwordEncrypt(user._id + Date.now()),
        });

        const accessData = {
            _id: user._id,
            username: user.username,
            email: user.email,
            isActive: user.isActive,
            role: user.role,
        };

        const accessToken = jwt.sign(accessData, process.env.ACCESS_KEY, { expiresIn: '1h' })
        const refreshToken = jwt.sign({ _id: user._id, password: user.password }, process.env.REFRESH_KEY, { expiresIn: '3d' })

        res.send({
            error: false,
            token: tokenData.token,
            bearer: { accessToken, refreshToken },
            user,
        });
    },

    refresh: async (req, res) => {
        const refreshToken = req.body?.bearer?.refreshToken;

        if (!refreshToken) {
            res.errorStatusCode = 401
            throw new Error('Please enter token.refresh');
        }

        jwt.verify(refreshToken, process.env.REFRESH_KEY, async function (err, userData) {
            if (err) {
                res.errorStatusCode = 401
                throw err
            }

            const { _id, password } = userData

            if (!(_id && password)) {
                res.errorStatusCode = 401
                throw new Error('Not found id or password in token.')
            }

            const user = await User.findOne({ _id });

            if (!(user && user.password == password)) {
                res.errorStatusCode = 401
                throw new Error('Wrong id or password.');
            }

            if (!user.isActive) {
                res.errorStatusCode = 401
                throw new Error('This account is not active.')
            }

            const accessData = {
                _id: user._id,
                username: user.username,
                email: user.email,
                isActive: user.isActive,
                role: user.role,
            };

            const accessToken = jwt.sign(accessData, process.env.ACCESS_KEY, { expiresIn: '1h' });

            res.send({
                error: false,
                bearer: { accessToken }
            })
        })
    },

    logout: async (req, res) => {
        const auth = req.headers?.authorization || null;
        const tokenKey = auth ? auth.split(' ') : null;

        let message = 'Logout successful';
        let result = {};

        if (tokenKey && tokenKey[0] === 'Token') {
            result = await Token.deleteOne({ token: tokenKey[1] });
            message = result.deletedCount 
                ? 'Token deleted. Logout was OK.' 
                : 'Token not found, but logout completed.';
        } else if (tokenKey && tokenKey[0] === 'Bearer') {
            message = 'JWT logout successful. Please delete token from client.';
        }

        res.status(200).send({
            error: false,
            message,
            result
        });
    },
};