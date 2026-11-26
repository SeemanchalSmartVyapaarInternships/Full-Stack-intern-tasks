import { Op } from 'sequelize';

/**
 * Builds Sequelize pagination, sorting, and LIKE search options.
 */
export function buildListQuery(query, { searchableFields = [], allowedSortFields = ['id', 'createdAt'] } = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 10));
  const offset = (page - 1) * limit;

  const sortBy = allowedSortFields.includes(query.sortBy) ? query.sortBy : 'id';
  const orderDir = String(query.order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const where = {};
  if (query.search && searchableFields.length > 0) {
    const term = `%${String(query.search).trim()}%`;
    where[Op.or] = searchableFields.map((field) => ({ [field]: { [Op.like]: term } }));
  }

  return {
    page,
    limit,
    offset,
    order: [[sortBy, orderDir]],
    where,
  };
}
