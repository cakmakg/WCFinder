"use strict";

const Business = require("../models/business");

/**
 * Business Repository - Data Access Layer
 * Sadece veritabanı işlemleri
 */
class BusinessRepository {
  async findById(id) {
    return await Business.findById(id);
  }

  async findOne(filter) {
    return await Business.findOne(filter);
  }

  async find(filter = {}) {
    return await Business.find(filter);
  }

  async create(data) {
    return await Business.create(data);
  }

  async findByIdAndUpdate(id, data, options = {}) {
    return await Business.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
      ...options,
    });
  }

  async updateMany(filter, update) {
    return await Business.updateMany(filter, update);
  }

  async deleteOne(filter) {
    return await Business.deleteOne(filter);
  }

  async findWithPagination(filter, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, populate = [] } = options;
    const skip = (page - 1) * limit;

    const query = Business.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort);

    populate.forEach((path) => {
      query.populate(path);
    });

    const [data, total] = await Promise.all([
      query.exec(),
      Business.countDocuments(filter),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = new BusinessRepository();

