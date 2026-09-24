const { validationResult } = require('express-validator');

// Middleware to check validation results from express-validator
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Return field-level errors formatted cleanly
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please check the submitted fields.',
      errors: formattedErrors
    });
  }

  next();
};

module.exports = validate;
