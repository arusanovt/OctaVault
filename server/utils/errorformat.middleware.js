module.exports = function (req, res, next) {
  res.jsonerror = function formatError(error) {
    if (!Array.isArray(error)) {
      error = [error];
    }

    res.status(400).json({
      errors: error.map(err=> {
        return {
          message: err.message,
          property: err.property,
          type: err.type,
        };
      }),
    });
  };
  next();
};
