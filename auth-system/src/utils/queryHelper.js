const { Op } = require("sequelize");

/**
 * Builds a standardized Sequelize query object from request query params.
 *
 * @param {Object}   req               - Express request object
 * @param {string[]} searchableFields  - Columns to apply `search` against (e.g. ["name", "description"])
 * @param {string[]} filterableFields  - Columns that accept exact-match filters (e.g. ["status", "priority"])
 * @param {string}   defaultSort       - Default sort column (prefix with - for DESC), e.g. "-createdAt"
 * @returns {{ where, order, limit, offset, page, limit: number }}
 */
function buildPaginatedQuery(req, searchableFields = [], filterableFields = [], defaultSort = "-createdAt") {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const offset = (page - 1) * limit;

  // ── WHERE clause ────────────────────────────────────────────
  const conditions = [];

  // Search: OR across all searchable text fields
  if (req.query.search && searchableFields.length > 0) {
    const searchTerm = `%${req.query.search}%`;
    conditions.push({
      [Op.or]: searchableFields.map((field) => ({
        [field]: { [Op.like]: searchTerm },
      })),
    });
  }

  // Exact-match filters
  for (const field of filterableFields) {
    if (req.query[field] !== undefined && req.query[field] !== "") {
      conditions.push({ [field]: req.query[field] });
    }
  }

  const where = conditions.length > 0 ? { [Op.and]: conditions } : {};

  // ── ORDER clause ────────────────────────────────────────────
  const sortParam = req.query.sort || defaultSort;
  const sortFields = sortParam.split(",").map((s) => {
    const trimmed = s.trim();
    if (trimmed.startsWith("-")) {
      return [trimmed.substring(1), "DESC"];
    }
    return [trimmed, "ASC"];
  });

  return { where, order: sortFields, limit, offset, page, pageSize: limit };
}

/**
 * Wraps the Sequelize result into a standardized paginated response.
 */
function paginatedResponse(data, count, page, pageSize) {
  const totalPages = Math.ceil(count / pageSize);
  return {
    success: true,
    data,
    pagination: {
      total: count,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

module.exports = { buildPaginatedQuery, paginatedResponse };
