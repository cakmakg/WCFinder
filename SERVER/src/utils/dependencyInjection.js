"use strict";
/**
 * Dependency Injection Utility
 * 
 * Provides dependency injection patterns for better testability.
 * Allows controllers and services to be tested with mock dependencies.
 * 
 * Clean Code Principles:
 * - Dependency Injection: Dependencies are injected rather than hardcoded
 * - Testability: Services can be easily mocked in tests
 * - Loose Coupling: Components depend on abstractions, not concrete implementations
 * 
 * Usage:
 * - Controllers inject service dependencies
 * - Services inject repository dependencies
 * - All dependencies can be easily mocked for unit testing
 * 
 * @module dependencyInjection
 */

/**
 * Service container for dependency injection
 * Allows registering and retrieving dependencies
 */
class ServiceContainer {
    constructor() {
        this.services = new Map();
        this.singletons = new Map();
    }

    /**
     * Register a service factory
     * Factory function will be called each time the service is requested
     * 
     * @param {string} name - Service name
     * @param {Function} factory - Factory function that returns the service instance
     */
    register(name, factory) {
        this.services.set(name, factory);
    }

    /**
     * Register a singleton service
     * Factory function will be called only once
     * 
     * @param {string} name - Service name
     * @param {Function} factory - Factory function that returns the service instance
     */
    registerSingleton(name, factory) {
        if (!this.singletons.has(name)) {
            this.singletons.set(name, factory());
        }
    }

    /**
     * Get a service instance
     * 
     * @param {string} name - Service name
     * @returns {*} Service instance
     */
    get(name) {
        // Check singletons first
        if (this.singletons.has(name)) {
            return this.singletons.get(name);
        }

        // Check registered services
        if (this.services.has(name)) {
            return this.services.get(name)();
        }

        throw new Error(`Service ${name} not found`);
    }

    /**
     * Clear all registered services (useful for testing)
     */
    clear() {
        this.services.clear();
        this.singletons.clear();
    }
}

// Global service container instance
const container = new ServiceContainer();

module.exports = {
    container,
    ServiceContainer
};
