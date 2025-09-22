"use strict";
/* -------------------------------------------------------
    | Permissions Middleware (Best Practice & Reusable) |
------------------------------------------------------- */

module.exports = {
    /**
     * Sadece giriş yapmış ve aktif olan kullanıcıların devam etmesine izin verir.
     */
    isLogin: (req, res, next) => {
        if (req.user && req.user.isActive) {
            return next();
        }
        res.errorStatusCode = 401; // Unauthorized
        throw new Error('NoPermission: You must login.');
    },

    /**
     * Bir kullanıcının, belirtilen dokümanın sahibi VEYA Admin olup olmadığını kontrol eden
     * yeniden kullanılabilir tek bir middleware fonksiyonu oluşturur.
     *
     * @param {mongoose.Model} Model Kontrol edilecek Mongoose modeli (Örn: Business, Reservation, Toilet).
     * @param {string} ownerPath Dokümanda sahip bilgisini tutan yol (Örn: 'userId', 'owner', 'business.owner').
     * @returns {Function} Express middleware fonksiyonu.
     */
    isOwnerOrAdmin: (Model, ownerPath) => {
        return async (req, res, next) => {
            // Admin her zaman yetkilidir.
            if (req.user.isAdmin) {
                return next();
            }

            // URL'den gelen ID ile ilgili dokümanı veritabanında bul.
            // Eğer dolaylı bir yol varsa (örn: 'business.owner'), populate etmemiz gerekir.
            const pathParts = ownerPath.split('.');
            let document;

            if (pathParts.length > 1) {
                // Populate edilecek yolu birleştir (son eleman hariç).
                const populateField = pathParts.slice(0, -1).join('.');
                document = await Model.findById(req.params.id).populate(populateField);
            } else {
                document = await Model.findById(req.params.id);
            }

            if (!document) {
                res.errorStatusCode = 404;
                throw new Error('Not Found: The requested resource could not be found.');
            }

            // Verilen yoldan sahip ID'sine ulaş.
            let ownerId = document;
            for (const part of pathParts) {
                if (ownerId === null || typeof ownerId === 'undefined') {
                    ownerId = null;
                    break;
                }
                ownerId = ownerId[part];
            }

            // Sahip ID'si ile giriş yapan kullanıcının ID'si eşleşiyor mu kontrol et.
            if (ownerId && ownerId.equals(req.user._id)) {
                return next(); // Yetkili.
            }

            res.errorStatusCode = 403;
            throw new Error('NoPermission: You must be an Admin or the owner of this resource.');
        };
    }
};