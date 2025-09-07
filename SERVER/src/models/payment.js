// payment.model.js

"use strict";
/* -------------------------------------------------------
                    Ödeme Modeli
     (Her bir finansal işlemin kaydını tutar)
------------------------------------------------------- */
const { mongoose } = require("../config/dbConnection");

const PaymentSchema = new mongoose.Schema({
    // Bu ödemenin hangi 'Kullanım' (Usage) işlemi için yapıldığını belirtir.
    // Her kullanımın bir ödemesi olacağı için bu alan zorunludur ve tektir.
    usage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usage',
        required: true,
        unique: true, // Bir kullanım kaydına sadece bir ödeme bağlanabilir.
    },

    // Ödemeyi yapan kullanıcı.
    // Bu bilgi 'usage' üzerinden de alınabilir ancak sorgu kolaylığı için burada da tutulması iyi bir pratiktir.
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },

    // Ödenen tutar. 'usage' modelindeki 'totalFee' ile eşleşmelidir.
    amount: {
        type: Number,
        required: true,
    },

    // Para birimi. Finansal kayıtlarda mutlaka olmalıdır.
    currency: {
        type: String,
        required: true,
        default: 'EUR', // Projenizin varsayılan para birimini yazabilirsiniz (örn: 'TRY')
    },

    // Ödemenin anlık durumu.
    status: {
        type: String,
        enum: ['pending', 'succeeded', 'failed'], // beklemede, başarılı, başarısız
        required: true,
        default: 'pending',
    },

    // Ödemenin yapıldığı yöntem (örn: kredi kartı, cüzdan vb.).
    paymentMethod: {
        type: String,
        trim: true,
        required: true,
        default: 'credit_card',
    },
    
    // Ödeme ağ geçidinden (Stripe, PayPal, Iyzico vb.) dönen benzersiz işlem kimliği.
    // Bu ID, bir ödemeyi takip etmek, iade yapmak veya destek taleplerini çözmek için hayati önem taşır.
    transactionId: {
        type: String,
        unique: true,
        index: true,
        sparse: true, // 'unique' index'in null değerlere izin vermesini sağlar.
    },
    
    // Ödeme ağ geçidinden dönen tüm yanıtı, hata ayıklama (debugging) amacıyla saklamak için opsiyonel bir alan.
    gatewayResponse: {
        type: mongoose.Schema.Types.Mixed,
    }

}, {
    collection: "payments",
    timestamps: true, // createdAt ve updatedAt alanlarını ekler.
});

module.exports = mongoose.model("Payment", PaymentSchema);