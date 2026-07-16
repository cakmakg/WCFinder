"use strict";

const { mongoose } = require("../config/dbConnection");

/**
 * Counter - Atomik sıra numarası üreteci
 *
 * MongoDB'de yarış-güvenli (transaction gerektirmeyen) sıralı numara üretmek için
 * kullanılır. Örn. Rechnungsnummer: her ay için bir sayaç (_id: "rechnung-2026-07").
 * findOneAndUpdate + $inc atomik olduğundan eşzamanlı istekler farklı numara alır.
 */
const CounterSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        seq: { type: Number, default: 0 },
    },
    { collection: "counters" }
);

module.exports = mongoose.model("Counter", CounterSchema);
