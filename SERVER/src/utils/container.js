"use strict";
/**
 * Dependency Injection Container
 * 
 * Test edilebilir kod için dependency injection pattern.
 * Controllers ve services arasında loose coupling sağlar.
 * 
 * Clean Code Principles:
 * - Dependency Inversion: High-level modules depend on abstractions
 * - Testability: Mock'lanabilir dependencies
 * - DRY: Dependency management tek bir yerde
 */

/**
 * Service Container
 * Singleton pattern ile tüm dependencies'i tutar
 */
class Container {
    constructor() {
        this.services = new Map();
        this.singletons = new Map();
    }

    /**
     * Service kaydet
     * 
     * @param {String} name - Service adı
     * @param {Function|Object} factory - Factory function veya instance
     * @param {Boolean} singleton - Singleton olarak mı kaydedilsin?
     */
    register(name, factory, singleton = true) {
        this.services.set(name, { factory, singleton });
    }

    /**
     * Service'i resolve et
     * 
     * @param {String} name - Service adı
     * @returns {*} Service instance
     */
    resolve(name) {
        const service = this.services.get(name);
        
        if (!service) {
            throw new Error(`Service "${name}" not found`);
        }

        // Singleton ise cache'den döndür
        if (service.singleton) {
            if (!this.singletons.has(name)) {
                const instance = typeof service.factory === 'function' 
                    ? service.factory(this) 
                    : service.factory;
                this.singletons.set(name, instance);
            }
            return this.singletons.get(name);
        }

        // Her seferinde yeni instance oluştur
        return typeof service.factory === 'function' 
            ? service.factory(this) 
            : service.factory;
    }

    /**
     * Tüm singleton'ları temizle (test için)
     */
    clear() {
        this.singletons.clear();
    }
}

// Global container instance
const container = new Container();

/**
 * Model'leri container'a kaydet
 * Lazy loading ile sadece gerektiğinde yüklenir
 */
container.register('User', () => require('../models/user'), true);
container.register('Business', () => require('../models/business'), true);
container.register('Toilet', () => require('../models/toilet'), true);
container.register('Usage', () => require('../models/usage'), true);
container.register('Payment', () => require('../models/payment'), true);
container.register('Review', () => require('../models/review'), true);
container.register('Token', () => require('../models/token'), true);
container.register('Payout', () => require('../models/payout'), true);
container.register('Rechnung', () => require('../models/rechnung'), true);

/**
 * Repository'leri kaydet
 */
container.register('BusinessRepository', () => require('../repositories/businessRepository'), true);
container.register('PaymentRepository', () => require('../repositories/paymentRepository'), true);
container.register('PayoutRepository', () => require('../repositories/payoutRepository'), true);
container.register('UsageRepository', () => require('../repositories/usageRepository'), true);

/**
 * Service'leri kaydet
 */
container.register('PaymentService', () => require('../services/paymentService'), true);
container.register('PayoutService', () => require('../services/payoutService'), true);
container.register('RechnungService', () => require('../services/rechnungService'), true);

/**
 * Helper'ları kaydet
 */
container.register('PasswordEncrypt', () => require('../helper/passwordEncrypt'), true);
container.register('SendMail', () => require('../helper/sendMail'), true);

/**
 * Logger'ı kaydet
 */
container.register('Logger', () => require('./logger'), true);

module.exports = container;

