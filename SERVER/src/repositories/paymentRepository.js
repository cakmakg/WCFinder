"use strict";
/**
 * Payment Repository - Data Access Layer
 * 
 * Implements Repository Pattern for payment data access.
 * Provides abstraction over database operations for better testability.
 * 
 * Clean Code Principles:
 * - Single Responsibility: Only handles payment data access
 * - Dependency Injection: Payment model can be injected (for testing)
 * - DRY: Centralizes all payment database operations
 * 
 * Performance:
 * - Optimized queries with proper field selection
 * - Efficient populate operations to avoid N+1 problems
 * 
 * Security:
 * - Input validation should be done at service/controller layer
 * - This layer only handles data access
 */
const Payment = require("../models/payment");

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

  /**
   * Ödemeyi atomik olarak "succeeded" yapar — yalnızca ilk çağrı kazanır.
   *
   * Aynı ödeme için frontend'in /stripe/confirm çağrısı ile Stripe'ın
   * payment_intent.succeeded webhook'u (ve webhook'un retry teslimatları)
   * birlikte gelir. Koşulsuz güncellemede her iki yol da usage oluşturup
   * işletme bakiyesini artırdığı için bakiye mükerrer artıyordu.
   *
   * @returns {Promise<Object|null>} İlk kez succeeded yapıldıysa güncel kayıt,
   *                                 ödeme zaten succeeded ise null.
   */
  async markSucceededOnce(id, data = {}) {
    return await Payment.findOneAndUpdate(
      { _id: id, status: { $ne: "succeeded" } },
      { ...data, status: "succeeded" },
      { new: true, runValidators: true }
    );
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

