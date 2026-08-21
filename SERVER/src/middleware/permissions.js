// middleware/permissions.js

"use strict"

module.exports = {
    isLogin: (req, res, next) => {
        if (req.user && req.user.isActive) {
            next();
        } else {
            res.errorStatusCode = 401;
            throw new Error('NoPermission: You must login.');
        }
    },

    isAdmin: (req, res, next) => {
        // Kimlik yok (token yok / süresi dolmuş) -> 401, böylece client token'ı
        // yenileyip isteği tekrarlayabilir. Kimlik var ama yetki yok -> 403.
        if (!req.user) {
            res.errorStatusCode = 401;
            throw new Error('NoPermission: You must login.');
        }
        if (req.user.isActive && req.user.role === 'admin') {
            next();
        } else {
            res.errorStatusCode = 403;
            throw new Error('NoPermission: You must be an Admin.');
        }
    },

    // ✅ YENİ: Owner veya Admin kontrolü
    isOwnerOrAdmin: (req, res, next) => {
        // Kimlik yok -> 401 (refresh tetiklenir), kimlik var ama yetki yok -> 403.
        if (!req.user) {
            res.errorStatusCode = 401;
            throw new Error('NoPermission: You must login.');
        }
        if (req.user.isActive &&
            (req.user.role === 'owner' || req.user.role === 'admin')) {
            next();
        } else {
            res.errorStatusCode = 403;
            throw new Error('NoPermission: You must be an Owner or Admin.');
        }
    },

    isSelfOrAdmin: (req, res, next) => {
        const userIdFromParams = req.params.id;
        const loggedInUserId = req.user._id.toString();

        if (req.user.role === 'admin' || userIdFromParams === loggedInUserId) {
            return next();
        }

        res.errorStatusCode = 403;
        throw new Error('NoPermission: You are not authorized to perform this action on another user.');
    }
};