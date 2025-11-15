"use strict";

const Payment = require("../models/payment");

/**
 * Payment Repository - Data Access Layer
 */
class PaymentRepository {
  async findById(id) {
    return await Payment.findById(id);
  }

  async findOne(filter) {
    return await Payment.findOne(filter);
  }

  async find(filter = {}) {
    return await Payment.find(filter);
  }

  async create(data) {
    return await Payment.create(data);
  }

  async findByIdAndUpdate(id, data, options = {}) {
    return await Payment.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
      ...options,
    });
  }

  async updateMany(filter, update) {
    return await Payment.updateMany(filter, update);
  }

  async deleteOne(filter) {
    return await Payment.deleteOne(filter);
  }

  async aggregate(pipeline) {
    return await Payment.aggregate(pipeline);
  }

  async findWithPopulate(filter, populate = []) {
    let query = Payment.find(filter);
    populate.forEach((path) => {
      query = query.populate(path);
    });
    return await query.exec();
  }
}

module.exports = new PaymentRepository();

