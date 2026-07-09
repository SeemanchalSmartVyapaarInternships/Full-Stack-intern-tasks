function notFound(req, _res, next) {
  const error = new Error(`Route ${req.originalUrl} not found.`);
  error.statusCode = 404;
  next(error);
}

function normalizeError(error) {
  if (error.name === "SequelizeUniqueConstraintError") {
    return {
      statusCode: 409,
      message: "A record with the same unique value already exists.",
      details: error.errors?.map((item) => ({ field: item.path, message: item.message })),
    };
  }

  if (error.name === "SequelizeValidationError") {
    return {
      statusCode: 422,
      message: "Validation failed.",
      details: error.errors?.map((item) => ({ field: item.path, message: item.message })),
    };
  }

  if (error.name?.startsWith("Sequelize")) {
    return {
      statusCode: 503,
      message: "Database operation failed. Please retry or contact support.",
    };
  }

  return {
    statusCode: error.statusCode || 500,
    message: error.message || "Internal server error.",
    details: error.details,
  };
}

function errorHandler(error, req, res, _next) {
  const normalized = normalizeError(error);
  const statusCode = normalized.statusCode;
  const requestId = req.id;

  if (statusCode >= 500) {
    console.error("Request failed", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      error: error.message,
      stack: error.stack,
    });
  }

  res.status(statusCode).json({
    success: false,
    message: normalized.message,
    requestId,
    details: normalized.details || undefined,
  });
}

module.exports = { notFound, errorHandler };
