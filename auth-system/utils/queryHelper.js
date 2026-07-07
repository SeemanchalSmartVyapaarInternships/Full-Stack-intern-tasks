// ============================================================
// Query Parsing Helper — Sequelize Pagination, Search, Sort & Filter
// ============================================================

const { Op } = require('sequelize');

/**
 * Parses query parameters for pagination, searching, sorting, and filtering.
 *
 * @param {Object} query - The req.query object.
 * @param {Object} options - Configurations for parsing.
 * @param {Array<string>} options.searchFields - List of model attribute names to run search against.
 * @param {Array<string>} options.filterFields - List of model attribute names that can be filtered (exact match).
 * @param {string} [options.defaultSortBy='id'] - Default attribute to sort by.
 * @param {string} [options.defaultSortOrder='ASC'] - Default sort order.
 * @returns {Object} Contains `sequelizeOptions` (where, order, limit, offset) and `pagination` details.
 */
function parseQueryParams(query, options = {}) {
  const {
    searchFields = [],
    filterFields = [],
    defaultSortBy = 'id',
    defaultSortOrder = 'ASC',
  } = options;

  // 1. Pagination
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const offset = (page - 1) * limit;

  const where = {};

  // 2. Search (Fuzzy text match using LIKE)
  if (query.search && searchFields.length > 0) {
    const searchVal = `%${query.search}%`;
    where[Op.or] = searchFields.map(field => ({
      [field]: { [Op.like]: searchVal }
    }));
  }

  // 3. Filtering (Exact match)
  filterFields.forEach(field => {
    if (query[field] !== undefined && query[field] !== '') {
      where[field] = query[field];
    }
  });

  // 4. Sorting
  const sortBy = query.sortBy || defaultSortBy;
  let sortOrder = (query.sortOrder || defaultSortOrder).toUpperCase();
  if (sortOrder !== 'ASC' && sortOrder !== 'DESC') {
    sortOrder = defaultSortOrder;
  }

  return {
    sequelizeOptions: {
      where,
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    },
    pagination: {
      page,
      limit,
    },
  };
}

module.exports = { parseQueryParams };
