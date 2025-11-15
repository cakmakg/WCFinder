"use strict";

const Usage = require("../models/usage");

/**
 * Usage Repository - Data Access Layer
 */
class UsageRepository {
  async findById(id) {
    return await Usage.findById(id);
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

