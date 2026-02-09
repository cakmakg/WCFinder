"use strict";
/**
 * Environment Variable Validator
 * 
 * Validates all required environment variables on application startup.
 * Prevents runtime errors by catching missing configuration early.
 * 
 * Clean Code Principles:
 * - Single Responsibility: Only validates environment variables
 * - DRY: Centralized validation logic
 * - Fail Fast: Application won't start with invalid configuration
 * 
 * Security:
 * - Ensures sensitive data is properly configured
 * - Prevents running with default/weak credentials
 */

const logger = require('./logger');

/**
 * Required environment variables by environment
 */
const REQUIRED_ENV_VARS = {
    // Common (all environments) - auth uses ACCESS_KEY + REFRESH_KEY
    common: [
        'MONGODB',
        'ACCESS_KEY',
        'REFRESH_KEY',
        'NODE_ENV'
    ],
    
    // Production-specific
    production: [
        'CORS_ORIGIN',
        'STRIPE_SECRET_KEY',
        'PAYPAL_CLIENT_ID',
        'PAYPAL_CLIENT_SECRET'
    ],
    
    // Development-specific (optional but recommended)
    development: []
};

/**
 * Validates environment variable format
 * @param {string} name - Environment variable name
 * @param {string} value - Environment variable value
 * @param {object} rules - Validation rules
 * @returns {{isValid: boolean, error?: string}}
 */
const validateEnvVar = (name, value, rules = {}) => {
    if (!value) {
        return { isValid: false, error: `${name} is required but not set` };
    }
    
    // Minimum length validation
    if (rules.minLength && value.length < rules.minLength) {
        return { 
            isValid: false, 
            error: `${name} must be at least ${rules.minLength} characters` 
        };
    }
    
    // Pattern validation (regex)
    if (rules.pattern && !rules.pattern.test(value)) {
        return { 
            isValid: false, 
            error: `${name} format is invalid` 
        };
    }
    
    // Must start with specific prefix
    if (rules.startsWith && !value.startsWith(rules.startsWith)) {
        return { 
            isValid: false, 
            error: `${name} must start with "${rules.startsWith}"` 
        };
    }
    
    return { isValid: true };
};

/**
 * Validation rules for specific environment variables
 */
const ENV_VAR_RULES = {
    MONGODB: {
        minLength: 10,
        pattern: /^mongodb(\+srv)?:\/\//,
        errorMessage: 'MongoDB connection string must be a valid MongoDB URI'
    },
    ACCESS_KEY: {
        minLength: 32,
        errorMessage: 'ACCESS_KEY (JWT access token secret) must be at least 32 characters'
    },
    REFRESH_KEY: {
        minLength: 32,
        errorMessage: 'REFRESH_KEY (JWT refresh token secret) must be at least 32 characters'
    },
    STRIPE_SECRET_KEY: {
        startsWith: 'sk_',
        minLength: 20,
        errorMessage: 'Stripe secret key must start with "sk_"'
    },
    STRIPE_PUBLISHABLE_KEY: {
        startsWith: 'pk_',
        minLength: 20,
        errorMessage: 'Stripe publishable key must start with "pk_"'
    },
    PAYPAL_CLIENT_ID: {
        startsWith: 'A',
        minLength: 20,
        errorMessage: 'PayPal client ID must start with "A"'
    },
    PAYPAL_CLIENT_SECRET: {
        minLength: 20,
        errorMessage: 'PayPal client secret must be at least 20 characters'
    }
};

/**
 * Validates all required environment variables
 * @param {string} env - Current environment (development, production, etc.)
 * @returns {{isValid: boolean, errors: string[]}}
 */
const validateEnvironment = (env = process.env.NODE_ENV || 'development') => {
    const errors = [];
    const allRequired = [...REQUIRED_ENV_VARS.common];
    
    // Add environment-specific requirements
    if (env === 'production') {
        allRequired.push(...REQUIRED_ENV_VARS.production);
    } else if (env === 'development') {
        allRequired.push(...REQUIRED_ENV_VARS.development);
    }
    
    // Validate each required variable
    for (const varName of allRequired) {
        const value = process.env[varName];
        const rules = ENV_VAR_RULES[varName];
        
        if (!value) {
            errors.push(`${varName} is required but not set`);
            continue;
        }
        
        // Apply validation rules if they exist
        if (rules) {
            const validation = validateEnvVar(varName, value, rules);
            if (!validation.isValid) {
                errors.push(validation.error || rules.errorMessage);
            }
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validates and logs environment configuration
 * Throws error if validation fails (fail-fast principle)
 */
const validateAndLogEnvironment = () => {
    const env = process.env.NODE_ENV || 'development';
    const validation = validateEnvironment(env);
    
    if (!validation.isValid) {
        logger.error('Environment validation failed', null, {
            errors: validation.errors,
            environment: env
        });
        
        console.error('\n❌ Environment Variable Validation Failed:');
        validation.errors.forEach((error, index) => {
            console.error(`   ${index + 1}. ${error}`);
        });
        console.error('\n💡 Please set all required environment variables before starting the application.\n');
        
        // In production, exit on validation failure
        if (env === 'production') {
            process.exit(1);
        } else {
            // In development, warn but continue
            logger.warn('Continuing with invalid environment (development mode)', {
                errors: validation.errors
            });
        }
    } else {
        logger.info('Environment validation passed', {
            environment: env,
            validatedVars: Object.keys(ENV_VAR_RULES).length
        });
    }
    
    return validation.isValid;
};

module.exports = {
    validateEnvironment,
    validateAndLogEnvironment,
    validateEnvVar,
    REQUIRED_ENV_VARS,
    ENV_VAR_RULES
};

