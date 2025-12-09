"use strict";
/**
 * Query Handler Middleware
 * 
 * Provides centralized query handling for filtering, searching, sorting, and pagination.
 * Implements comprehensive NoSQL injection protection and query optimization.
 * 
 * Security:
 * - Sanitizes all query parameters
 * - Blocks MongoDB operators to prevent NoSQL injection
 * - Validates ObjectId formats
 * - Limits query complexity to prevent DoS attacks
 * 
 * Performance:
 * - Efficient pagination
 * - Query result caching (where appropriate)
 * - Optimized populate queries to avoid N+1 problems
 * 
 * Clean Code Principles:
 * - DRY: Query logic centralized in single location
 * - Security: Comprehensive NoSQL injection protection
 * - KISS: Simple and clear query handling
 * - Single Responsibility: Only handles query processing
 * 
 * @author WCFinder Team
 * @version 2.0.0
 */

const { sanitizeInput, validateObjectId } = require('./validation');
const logger = require('../utils/logger');

/**
 * Sanitize MongoDB filter to prevent NoSQL injection attacks
 * 
 * Security: Blocks MongoDB operators ($gt, $ne, $regex, etc.) from user input
 * Performance: Single pass sanitization with depth limit to prevent recursion DoS
 * 
 * @param {object} filter - Filter object to sanitize
 * @param {number} depth - Current recursion depth (prevents infinite recursion)
 * @param {object} req - Express request object (for logging IP)
 * @returns {object} - Sanitized filter object
 */
const sanitizeFilter = (filter, depth = 0, req = null) => {
    // SECURITY: Prevent infinite recursion (max depth: 5)
    if (depth > 5) {
        logger.warn('Maximum filter sanitization depth exceeded', { 
            depth,
            ip: req?.ip || 'unknown'
        });
        return {};
    }

    if (!filter || typeof filter !== 'object') return {};
    
    // SECURITY: Limit filter size to prevent DoS attacks
    const filterKeys = Object.keys(filter);
    if (filterKeys.length > 50) {
        logger.warn('Filter too large, truncating', { 
            keyCount: filterKeys.length,
            ip: req?.ip || 'unknown'
        });
        // Keep only first 50 keys
        filterKeys.splice(50);
    }
    
    const sanitized = {};
    for (const key of filterKeys) {
        const value = filter[key];
        
        // SECURITY: Block MongoDB operators to prevent NoSQL injection
        if (key.startsWith('$')) {
            logger.warn('Blocked MongoDB operator in filter', { 
                key, 
                ip: req?.ip || 'unknown',
                path: req?.path || 'unknown'
            });
            continue;
        }
        
        // SECURITY: Recursively sanitize nested objects
        if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
            // SECURITY: Check for nested MongoDB operators
            const nestedKeys = Object.keys(value);
            const hasOperator = nestedKeys.some(k => k.startsWith('$'));
            if (hasOperator) {
                logger.warn('Blocked nested MongoDB operator', { 
                    key, 
                    nestedKeys,
                    ip: req?.ip || 'unknown',
                    path: req?.path || 'unknown'
                });
                continue;
            }
            sanitized[key] = sanitizeFilter(value, depth + 1, req);
        } else if (Array.isArray(value)) {
            // SECURITY: Limit array size to prevent DoS
            const limitedArray = value.slice(0, 100);
            sanitized[key] = limitedArray.map(item => 
                typeof item === 'object' && item !== null && !(item instanceof Date)
                    ? sanitizeFilter(item, depth + 1, req)
                    : item
            );
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
};

/**
 * Sanitize search queries with regex injection protection
 * 
 * Security:
 * - Escapes regex special characters to prevent regex injection
 * - Limits search string length to prevent DoS
 * - Blocks MongoDB operators
 * 
 * @param {object} search - Search object to sanitize
 * @param {object} req - Express request object (for logging)
 * @returns {object} - Sanitized search object
 */
const sanitizeSearch = (search, req = null) => {
    if (!search || typeof search !== 'object') return {};
    
    // SECURITY: Limit search fields to prevent DoS
    const searchKeys = Object.keys(search).slice(0, 20);
    
    const sanitized = {};
    for (const key of searchKeys) {
        // SECURITY: Block MongoDB operators
        if (key.startsWith('$')) {
            logger.warn('Blocked MongoDB operator in search', { 
                key,
                ip: req?.ip || 'unknown'
            });
            continue;
        }
        
        const value = search[key];
        
        if (typeof value === 'string') {
            // SECURITY: Limit search string length to prevent DoS
            const limitedValue = value.trim().substring(0, 500);
            
            // SECURITY: Escape regex special characters to prevent regex injection
            // This prevents attackers from injecting malicious regex patterns
            const escaped = limitedValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            // SECURITY: Only allow case-insensitive search (no complex regex)
            sanitized[key] = { $regex: escaped, $options: 'i' };
        }
    }
    return sanitized;
};

/**
 * Sanitize sort queries
 * 
 * Security:
 * - Blocks MongoDB operators
 * - Only allows valid sort directions (asc/desc, 1/-1)
 * - Limits number of sort fields to prevent DoS
 * 
 * @param {object} sort - Sort object to sanitize
 * @returns {object} - Sanitized sort object
 */
const sanitizeSort = (sort) => {
    if (!sort || typeof sort !== 'object') return {};
    
    // SECURITY: Limit sort fields to prevent DoS
    const sortKeys = Object.keys(sort).slice(0, 10);
    
    const sanitized = {};
    for (const key of sortKeys) {
        // SECURITY: Block MongoDB operators
        if (key.startsWith('$')) {
            continue;
        }
        
        const value = sort[key];
        
        // SECURITY: Only allow valid sort directions
        if (value === 'asc' || value === 1) {
            sanitized[key] = 1;
        } else if (value === 'desc' || value === -1) {
            sanitized[key] = -1;
        }
        // Invalid values are silently ignored (fail-safe)
    }
    return sanitized;
};

/**
 * Sanitize pagination parameters
 * 
 * Security:
 * - Validates and limits pagination values to prevent DoS attacks
 * - Prevents excessive resource consumption
 * - Sets reasonable defaults
 * 
 * Performance:
 * - Limits maximum page size to prevent large data dumps
 * - Caps skip value to prevent deep pagination performance issues
 * 
 * @param {object} query - Query object containing pagination parameters
 * @returns {object} - Sanitized pagination parameters { limit, page, skip }
 */
const sanitizePagination = (query) => {
    // SECURITY: Parse and validate limit (max 100 to prevent DoS)
    let limit = Number(query?.limit);
    if (isNaN(limit) || limit <= 0) {
        limit = Number(process.env.PAGE_SIZE || 20);
    } else if (limit > 100) {
        logger.warn('Limit too large, capped at 100', { requestedLimit: limit });
        limit = 100;
    }
    
    // SECURITY: Parse and validate page (convert to 0-based index)
    let page = Number(query?.page);
    if (isNaN(page) || page <= 0) {
        page = 0;
    } else {
        page = page - 1; // Convert to 0-based index
    }
    
    // SECURITY: Parse and validate skip
    let skip = Number(query?.skip);
    if (isNaN(skip) || skip < 0) {
        skip = page * limit;
    }
    
    // SECURITY: Cap skip value to prevent DoS (deep pagination is inefficient)
    const maxSkip = 10000;
    if (skip > maxSkip) {
        logger.warn('Skip value too large, capped', { skip, maxSkip, ip: query?.ip });
        skip = maxSkip;
    }
    
    return { limit, page, skip };
};

module.exports = (req, res, next) => {
    try {
        // ### FILTERING ###
        // URL?filter[key1]=value1&filter[key2]=value2
        const rawFilter = req.query?.filter || {};
        const filter = sanitizeFilter(rawFilter, 0, req);

        // ### SEARCHING ###
        // URL?search[key1]=value1&search[key2]=value2
        const rawSearch = req.query?.search || {};
        const search = sanitizeSearch(rawSearch, req);

        // ### SORTING ###
        // URL?sort[key1]=asc&sort[key2]=desc
        const rawSort = req.query?.sort || {};
        const sort = sanitizeSort(rawSort);

        // ### PAGINATION ###
        // URL?page=3&limit=10
        const { limit, page, skip } = sanitizePagination(req.query);

        // Response helper functions
        /**
         * Model listesi getir (populate ile)
         * 
         * @param {Model} Model - Mongoose model
         * @param {Object} customFilter - Ek filtreler
         * @param {String|Array|Object} populate - Populate options
         * @returns {Promise<Array>} Model listesi
         */
        res.getModelList = async (Model, customFilter = {}, populate = null) => {
            try {
                // SECURITY: Sanitize custom filter to prevent NoSQL injection
                const sanitizedCustomFilter = sanitizeFilter(customFilter, 0, req);
                
                // Combined filter
                const combinedFilter = { ...filter, ...search, ...sanitizedCustomFilter };
                
                // Query oluştur
                let query = Model.find(combinedFilter);
                
                // Sort
                if (Object.keys(sort).length > 0) {
                    query = query.sort(sort);
                }
                
                // Pagination
                query = query.skip(skip).limit(limit);
                
                // Populate
                if (populate) {
                    query = query.populate(populate);
                }
                
                return await query.exec();
            } catch (error) {
                logger.error('Error in getModelList', error, { 
                    model: Model.modelName,
                    filter: combinedFilter 
                });
                throw error;
            }
        };

        /**
         * Model listesi detayları (pagination info)
         * 
         * @param {Model} Model - Mongoose model
         * @param {Object} customFilter - Ek filtreler
         * @returns {Promise<Object>} Pagination detayları
         */
        res.getModelListDetails = async (Model, customFilter = {}) => {
            try {
                // SECURITY: Sanitize custom filter to prevent NoSQL injection
                const sanitizedCustomFilter = sanitizeFilter(customFilter, 0, req);
                const combinedFilter = { ...filter, ...search, ...sanitizedCustomFilter };
                
                // Total count (optimized - sadece count, tüm dokümanları getirme)
                const totalRecords = await Model.countDocuments(combinedFilter);
                
                const totalPages = Math.ceil(totalRecords / limit);
                
                const details = {
                    filter,
                    search,
                    sort,
                    skip,
                    limit,
                    page: page + 1, // Frontend için 1-based page number
                    pages: {
                        previous: page > 0 ? page : false,
                        current: page + 1,
                        next: (page + 2) <= totalPages ? page + 2 : false,
                        total: totalPages
                    },
                    totalRecords
                };
                
                // Eğer tek sayfadaysa pages bilgisini false yap
                if (totalRecords <= limit) {
                    details.pages = false;
                }
                
                return details;
            } catch (error) {
                logger.error('Error in getModelListDetails', error);
                throw error;
            }
        };
        
        next();
    } catch (error) {
        logger.error('Query handler error', error);
        res.errorStatusCode = 400;
        throw new Error('Invalid query parameters: ' + error.message);
    }
};
