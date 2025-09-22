"use strict";

const Review = require("../models/review");

module.exports = {
  // GET: Tüm yorumları listeleme
  list: async (req, res) => {
    /*
      #swagger.tags = ["Reviews"]
      #swagger.summary = "List all reviews"
    */
    const data = await res.getModelList(Review, {}, ["userId", "toiletId"]);

    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Review),
      result: data,
    });
  },

  // POST: Yeni bir yorum oluşturma
 create: async (req, res) => {
    /*
      #swagger.tags = ["Reviews"]
      #swagger.summary = "Create Review"
    */

    // Bu satır çok önemli! Yorumu yapan kullanıcının ID'sini ekler.
    req.body.userId = req.user._id;

    const data = await Review.create(req.body);

    res.status(201).send({
      error: false,
      data,
    });
  },

  // GET: Belirli bir yorumu ID ile okuma
  read: async (req, res) => {
    /*
      #swagger.tags = ["Reviews"]
      #swagger.summary = "Get a single review by ID"
    */
    const result = await Review.findById(req.params.id).populate([
      { path: "userId", select: "firstName lastName email" },
      { path: "toiletId", select: "name location" },
    ]);

    if (!result) {
      return res.status(404).send({
        error: true,
        message: "Review not found.",
      });
    }

    res.status(200).send({
      error: false,
      result,
    });
  },

  // PUT/PATCH: Belirli bir yorumu güncelleme
  update: async (req, res) => {
    /*
      #swagger.tags = ["Reviews"]
      #swagger.summary = "Update an existing review"
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          "rating": 4,
          "comment": "Still good, but could be better."
        }
      }
    */
    const result = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      return res.status(404).send({
        error: true,
        message: "Review not found for update.",
      });
    }

    res.status(202).send({
      error: false,
      result,
    });
  },

  // DELETE: Belirli bir yorumu silme
  deletee: async (req, res) => {
    /*
      #swagger.tags = ["Reviews"]
      #swagger.summary = "Delete a review"
    */
    const result = await Review.findByIdAndDelete(req.params.id);

    if (result) {
      res.status(204).send(); // Silme başarılıysa 204 No Content döndür
    } else {
      res.status(404).send({
        error: true,
        message: "Review not found or already deleted.",
      });
    }
  },
};