/**
 * Formats a numeric value as currency.
 * @param {number} amount
 * @param {string} currency
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'INR') {
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats large numbers with compact suffixes (e.g., 1.4M, 48.2K).
 * @param {number} value
 * @returns {string}
 */
export function formatCompactNumber(value) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Computes percentage capped between 0 and 100.
 * @param {number} used
 * @param {number} limit
 * @returns {number}
 */
export function computeUsagePercent(used, limit) {
  if (!limit || limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

/**
 * Escapes a single CSV field safely.
 * @param {unknown} value
 * @returns {string}
 */
export function csvEscape(value) {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts activity rows into a downloadable CSV string.
 * @param {Array<object>} rows
 * @returns {string}
 */
export function buildActivityCsv(rows) {
  const headers = [
    'ID',
    'Actor',
    'Role',
    'Action',
    'Resource',
    'Category',
    'Status',
    'Timestamp',
    'IP Address',
  ];
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(
      [
        row.id,
        row.actor,
        row.actorRole,
        row.action,
        row.resource,
        row.category,
        row.status,
        row.timestamp,
        row.ip,
      ]
        .map(csvEscape)
        .join(',')
    );
  }
  return lines.join('\n');
}
