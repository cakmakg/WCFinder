"use strict";
/**
 * Query Handler Middleware
 * 
 * Filtering, searching, sorting ve pagination işlemlerini yönetir.
 * NoSQL injection koruması ile güvenli query handling.
 * 
 * Clean Code Principles:
 * - DRY: Query logic tek bir yerde
 * - Security: NoSQL injection koruması
 * - KISS: Basit ve anlaşılır query handling
 */

const { sanitizeInput, validateObjectId } = require('./validation');
const logger = require('../utils/logger');

/**
 * MongoDB operatörlerini temizle (NoSQL injection koruması)
 * Kullanıcıların $gt, $ne, $regex gibi operatörleri kullanmasını engeller
 */
const sanitizeFilter = (filter) => {
    if (!filter || typeof filter !== 'object') return {};
    
    const sanitized = {};
    for (const [key, value] of Object.entries(filter)) {
        // MongoDB operatörlerini atla
        if (key.startsWith('$')) {
            logger.warn('Blocked MongoDB operator in filter', { key, ip: 'req.ip' });
            continue;
        }
        
        // Nested object'leri recursive olarak sanitize et
        if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
            // İç içe MongoDB operatörlerini kontrol et
            const hasOperator = Object.keys(value).some(k => k.startsWith('$'));
            if (hasOperator) {
                logger.warn('Blocked nested MongoDB operator', { key, ip: 'req.ip' });
                continue;
            }
            sanitized[key] = sanitizeFilter(value);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
};

/**
 * Search query'lerini sanitize et
 */
const sanitizeSearch = (search) => {
    if (!search || typeof search !== 'object') return {};
    
    const sanitized = {};
    for (const [key, value] of Object.entries(search)) {
        if (key.startsWith('$')) {
            continue; // MongoDB operatörlerini atla
        }
        
        if (typeof value === 'string') {
            // Regex injection koruması: özel karakterleri escape et
            const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            sanitized[key] = { $regex: escaped, $options: 'i' };
        }
    }
    return sanitized;
};

/**
 * Sort query'lerini validate et
 */
const sanitizeSort = (sort) => {
    if (!sort || typeof sort !== 'object') return {};
    
    const sanitized = {};
    for (const [key, value] of Object.entries(sort)) {
        if (key.startsWith('$')) {
            continue; // MongoDB operatörlerini atla
        }
        
        // Sadece 'asc', 'desc', 1, -1 değerlerine izin ver
        if (value === 'asc' || value === 1) {
            sanitized[key] = 1;
        } else if (value === 'desc' || value === -1) {
            sanitized[key] = -1;
        }
    }
    return sanitized;
};

/**
 * Pagination parametrelerini validate et
 */
const sanitizePagination = (query) => {
    let limit = Number(query?.limit);
    let page = Number(query?.page);
    let skip = Number(query?.skip);
    
    // Limit validation (max 100, min 1)
    limit = limit > 0 && limit <= 100 ? limit : Number(process.env.PAGE_SIZE || 20);
    
    // Page validation
    page = page > 0 ? (page - 1) : 0;
    
    // Skip validation
    skip = skip > 0 ? skip : (page * limit);
    
    // Max skip kontrolü (DoS koruması)
    const maxSkip = 10000;
    if (skip > maxSkip) {
        logger.warn('Skip value too large, capped', { skip, maxSkip });
        skip = maxSkip;
    }
    
    return { limit, page, skip };
};

module.exports = (req, res, next) => {
    try {
        // ### FILTERING ###
        // URL?filter[key1]=value1&filter[key2]=value2
        const rawFilter = req.query?.filter || {};
        const filter = sanitizeFilter(rawFilter);

        // ### SEARCHING ###
        // URL?search[key1]=value1&search[key2]=value2
        const rawSearch = req.query?.search || {};
        const search = sanitizeSearch(rawSearch);

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
                // Custom filter'ı da sanitize et
                const sanitizedCustomFilter = sanitizeFilter(customFilter);
                
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
                const sanitizedCustomFilter = sanitizeFilter(customFilter);
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
