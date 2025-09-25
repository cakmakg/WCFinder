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
        if (req.user && req.user.isActive && req.user.isAdmin) {
            next();
        } else {
            res.errorStatusCode = 403;
            throw new Error('NoPermission: You must be an Admin.');
        }
    },
    /**
     * Bir işlemi yapan kullanıcının, işlem yapılan KULLANICININ kendisi 
     * VEYA Admin olup olmadığını kontrol eder.
     * Bu, /users/:id gibi endpoint'ler için kullanılır.
     */
    isSelfOrAdmin: (req, res, next) => {
        const userIdFromParams = req.params.id;
        const loggedInUserId = req.user._id.toString();

        // Eğer kullanıcı Admin ise veya kendi profili üzerinde işlem yapıyorsa, devam et.
        if (req.user.isAdmin || userIdFromParams === loggedInUserId) {
            return next();
        }

        res.errorStatusCode = 403;
        throw new Error('NoPermission: You are not authorized to perform this action on another user.');
    }
};
