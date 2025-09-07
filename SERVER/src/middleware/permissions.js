// middleware/permissions.js (Ayrı Ayrı Kontrollerle Güncellenmiş Hali)

"use strict"
/* -------------------------------------------------------
    | Permissions Middleware |
------------------------------------------------------- */

module.exports = {

    /**
     * Sadece giriş yapmış ve aktif olan kullanıcıların devam etmesine izin verir.
     */
    isLogin: (req, res, next) => {
        if (req.user && req.user.isActive) {
            next();
        } else {
            res.errorStatusCode = 401; // Unauthorized (Giriş yapılmamış)
            throw new Error('NoPermission: You must login.');
        }
    },

    /**
     * SADECE Admin olan kullanıcıların devam etmesine izin verir.
     */
    isAdmin: (req, res, next) => {
        if (req.user && req.user.isActive && req.user.isAdmin) {
            next();
        } else {
            res.errorStatusCode = 403; // Forbidden (Yetkisi yok)
            throw new Error('NoPermission: You must be an Admin.');
        }
    },

    /**
     * SADECE 'owner' rolüne sahip kullanıcıların devam etmesine izin verir.
     * Bu fonksiyon artık admin kontrolü yapmaz.
     */
    isOwner: (req, res, next) => {
        if (req.user && req.user.isActive && req.user.role === 'owner') {
            next();
        } else {
            res.errorStatusCode = 403; // Forbidden
            throw new Error('NoPermission: You must have an "owner" role.');
        }
    },

    isOwnerOrAdmin: (req, res, next) => {
        if (req.user && req.user.isActive && (req.user.isAdmin || req.user.role === 'owner')) {
            next();
        } else {
            res.errorStatusCode = 403;
            throw new Error('NoPermission: You must be an Admin or an Owner.');
        }
    }
}