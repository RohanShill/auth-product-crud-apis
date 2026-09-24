const { body, param, query } = require('express-validator');

const createProductRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 120 })
    .withMessage('Product name must be between 2 and 120 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 5 })
    .withMessage('Description must be at least 5 characters long'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a number greater than 0'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),

  body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be an integer of 0 or greater')
];

const updateProductRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID format'),

  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ min: 2, max: 120 })
    .withMessage('Product name must be between 2 and 120 characters'),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ min: 5 })
    .withMessage('Description must be at least 5 characters long'),

  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a number greater than 0'),

  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be an integer of 0 or greater')
];

const productIdParamRule = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID format')
];

const listProductQueryRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100')
];

module.exports = {
  createProductRules,
  updateProductRules,
  productIdParamRule,
  listProductQueryRules
};
