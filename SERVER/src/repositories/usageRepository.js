"use strict";

const Usage = require("../models/usage");

/**
 * Usage Repository - Data Access Layer
 */
class UsageRepository {
  async findById(id, options = {}) {
    let query = Usage.findById(id);
    // populate desteği: çağıranlar { populate: [{ path, select }, ...] } geçebilir.
    // Bu olmadan sendPaymentSuccessEmail user'ı populate edemez ve mail gitmez.
    if (options.populate) {
      query = query.populate(options.populate);
    }
    return await query;
  }

  async findOne(filter) {
    return await Usage.findOne(filter);
  }

  async find(filter = {}) {
    return await Usage.find(filter);
  }

  async create(data) {
    return await Usage.create(data);
  }

  async findByIdAndUpdate(id, data, options = {}) {
    return await Usage.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
      ...options,
    });
  }

  async countDocuments(filter) {
    return await Usage.countDocuments(filter);
  }

  async aggregate(pipeline) {
    return await Usage.aggregate(pipeline);
  }

  async findWithPopulate(filter, populate = []) {
    let query = Usage.find(filter);
    populate.forEach((path) => {
      query = query.populate(path);
    });
    return await query.exec();
  }
}

module.exports = new UsageRepository();

