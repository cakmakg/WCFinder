"use strict";

const Payout = require("../models/payout");

/**
 * Payout Repository - Data Access Layer
 */
class PayoutRepository {
  async findById(id) {
    return await Payout.findById(id);
  }

  async findOne(filter) {
    return await Payout.findOne(filter);
  }

  async find(filter = {}) {
    return await Payout.find(filter);
  }

  async create(data) {
    return await Payout.create(data);
  }

  async findByIdAndUpdate(id, data, options = {}) {
    return await Payout.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
      ...options,
    });
  }

  async updateMany(filter, update) {
    return await Payout.updateMany(filter, update);
  }

  async deleteOne(filter) {
    return await Payout.deleteOne(filter);
  }

  async findWithPopulate(filter, populate = []) {
    let query = Payout.find(filter);
    populate.forEach((path) => {
      query = query.populate(path);
    });
    return await query.exec();
  }
}

module.exports = new PayoutRepository();

