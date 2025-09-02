"use strict";

const Reservation = require("../models/reservation");

module.exports = {
  // GET: Tüm rezervasyonları listeleme
  list: async (req, res) => {
    /*
      #swagger.tags = ["Reservations"]
      #swagger.summary = "List all reservations"
    */
    const data = await res.getModelList(Reservation, {}, ['userId', 'toiletId']);

    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Reservation),
      result: data,
    });
  },

  // POST: Yeni bir rezervasyon oluşturma
  create: async (req, res) => {
    /*
      #swagger.tags = ["Reservations"]
      #swagger.summary = "Create a new reservation"
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          "userId": "60c72b2f9b1e8e001c8e4a9e",
          "toiletId": "60c72b2f9b1e8e001c8e4a9e"
        }
      }
    */
    const result = await Reservation.create(req.body);

    res.status(201).send({
      error: false,
      result,
    });
  },

  // GET: Belirli bir rezervasyonu ID ile okuma
  read: async (req, res) => {
    /*
      #swagger.tags = ["Reservations"]
      #swagger.summary = "Get a single reservation by ID"
    */
    const result = await Reservation.findById(req.params.id).populate([
      { path: 'userId', select: 'firstName lastName email' },
      { path: 'toiletId', select: 'location type' }
    ]);

    if (!result) {
      return res.status(404).send({
        error: true,
        message: "Reservation not found."
      });
    }

    res.status(200).send({
      error: false,
      result,
    });
  },

  // PUT/PATCH: Belirli bir rezervasyonu güncelleme
  update: async (req, res) => {
    /*
      #swagger.tags = ["Reservations"]
      #swagger.summary = "Update an existing reservation"
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          "userId": "60c72b2f9b1e8e001c8e4a9e",
          "toiletId": "60c72b2f9b1e8e001c8e4a9e"
        }
      }
    */
    const result = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      return res.status(404).send({
        error: true,
        message: "Reservation not found for update."
      });
    }

    res.status(202).send({
      error: false,
      result,
    });
  },

  // DELETE: Belirli bir rezervasyonu silme
  deletee: async (req, res) => {
    /*
      #swagger.tags = ["Reservations"]
      #swagger.summary = "Delete a reservation"
    */
    const result = await Reservation.findByIdAndDelete(req.params.id);

    if (result) {
      res.status(204).send(); // Silme başarılıysa 204 No Content döndür
    } else {
      res.status(404).send({
        error: true,
        message: "Reservation not found or already deleted.",
      });
    }
  },
};