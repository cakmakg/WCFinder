"use strict"
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
// Middleware: permissions

module.exports = {

    isLogin: (req, res, next) => {

        // any User:
        if (req.user && req.user.isActive) {

            next()

        } else {

            res.errorStatusCode = 403
            throw new Error('NoPermission: You must login.')
        }
    },

    isAdmin: (req, res, next) => {

        // only Admin:
        if (req.user && req.user.isActive && req.user.isAdmin) {

            next()

        } else {

            res.errorStatusCode = 403
            throw new Error('NoPermission: You must login and to be Admin.')
        }
    },
    // middleware/permissions.js dosyasında
      isOwner: (req, res, next) => {
        
    if (req.user && req.user.isActive && (req.user.isAdmin || req.user.isOwner)) {
        next();
    } else {
        res.errorStatusCode = 403;
        throw new Error('NoPermission: You must be an owner to perform this action.');
    }
},

    
}