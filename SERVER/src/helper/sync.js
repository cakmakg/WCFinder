"use strict"
/* -------------------------------------------------------
    WCFinder Project - Syncronization
------------------------------------------------------- */
// sync():

module.exports = async function () {

    /* REMOVE DATABASE */
    const { mongoose } = require('../config/dbConnection')
    await mongoose.connection.dropDatabase()
    console.log('- Database and all data DELETED!')
    /* REMOVE DATABASE */

    /* User */
    const User = require('../models/user')
    await User.deleteMany() // Koleksiyonu temizle
    await User.create({
        "username": "admin",
        "password": "password123", // Şifrelerinizi mutlaka güncelleyin
        "email": "admin@site.com",
        "firstName": "admin",
        "lastName": "admin",
        "role": "admin",
        "isStaff": true,
        "isAdmin": true,
        "isActive": true
    })
    await User.create({
        "username": "owner",
        "password": "password123",
        "email": "owner@site.com",
        "firstName": "owner",
        "lastName": "owner",
        "role": "owner",
        "isStaff": true,
        "isAdmin": false,
        "isActive": true
    })
    await User.create({
        "username": "user",
        "password": "password123",
        "email": "user@site.com",
        "firstName": "user",
        "lastName": "user",
        "role": "user",
        "isStaff": false,
        "isAdmin": false,
        "isActive": true
    })
    console.log('- Users synchronized.')

    /* BussinessType */
    const BussinessType = require('../models/bussinessType')
    await BussinessType.deleteMany()
    await BussinessType.create({ "Spanish": "Restoran" })
    await BussinessType.create({ "Express": "Kafe" })
    await BussinessType.create({ "Huma": "Alışveriş Merkezi" })
    await BussinessType.create({ "ARal": "Benzin İstasyonu" })
    await BussinessType.create({ "One": "Otel" })
    console.log('- BussinessTypes synchronized.')
    
    // Oluşturulan verilerin ID'lerini almak için tekrar sorgulama
    const adminUser = await User.findOne({ username: 'admin' })
    const ownerUser = await User.findOne({ username: 'owner' })
    const cafeType = await BussinessType.findOne({ name: 'Kafe' })
    const restaurantType = await BussinessType.findOne({ name: 'Restoran' })
    const hotelType = await BussinessType.findOne({ name: 'Otel' })

    /* Bussiness (İşletme) */
    const Bussiness = require('../models/bussiness')
    await Bussiness.deleteMany()
    const bussiness1 = await Bussiness.create({
       "name": "Deutsche Cafe",
            "address": "Hauptstraße 1, 53111 Bonn, Germany",
            "location": {
                "type": "Point",
                "coordinates": [7.10093, 50.7374]
            },
        "type": cafeType._id,
        "owner": ownerUser._id
    })
    const bussiness2 = await Bussiness.create({
    "name": "Bonn Restaurant",
            "address": "Münsterplatz 1, 53111 Bonn, Germany",
            "location": {
                "type": "Point",
                "coordinates": [7.10087, 50.7358]
            },
        "type": restaurantType._id,
        "owner": ownerUser._id
    })
    const bussiness3 = await Bussiness.create({
       "name": "Cologne Hotel",
            "address": "Domkloster 4, 50667 Köln, Germany",
            "location": {
                "type": "Point",
                "coordinates": [6.95831, 50.9413]
            },
        "type": hotelType._id,
        "owner": ownerUser._id
    })
    console.log('- Bussiness synchronized.')
    
    /* Toilet (Tuvalet) */
    const Toilet = require('../models/toilet')
    await Toilet.deleteMany()
    const toilet1 = await Toilet.create({
        "business": bussiness1._id,
        "isAvailable": true,
        "price": 2,
        "gender": "Unisex",
        "accessible": true
    })
    const toilet2 = await Toilet.create({
        "business": bussiness2._id,
        "isAvailable": false,
        "price": 2,
        "gender": "Male",
        "accessible": false
    })
    const toilet3 = await Toilet.create({
        "business": bussiness3._id,
        "isAvailable": true,
        "price": 2,
        "gender": "Female",
        "accessible": true
    })
    console.log('- Toilets synchronized.')

    /* Review (Yorum) */
    const Review = require('../models/review')
    await Review.deleteMany()
    await Review.create({
        "userId": adminUser._id,
        "toiletId": toilet1._id,
        "rating": 5,
        "comment": "Çok temiz ve modern bir tuvalet!"
    })
    await Review.create({
        "userId": ownerUser._id,
        "toiletId": toilet2._id,
        "rating": 2,
        "comment": "Kullanım için para alınıyor, bu yüzden puanım düşük."
    })
    await Review.create({
        "userId": adminUser._id,
        "toiletId": toilet3._id,
        "rating": 4,
        "comment": "Oldukça iyi, ama biraz daha temiz olabilirdi."
    })
    console.log('- Reviews synchronized.')

    /* Reservation (Rezervasyon) */
    const Reservation = require('../models/reservation')
    await Reservation.deleteMany()
    await Reservation.create({
        "userId": ownerUser._id,
        "toiletId": toilet1._id
    })
    await Reservation.create({
        "userId": adminUser._id,
        "toiletId": toilet3._id
    })
    console.log('- Reservations synchronized.')

    /* Finished */
    console.log('* All data synchronized successfully.')
}