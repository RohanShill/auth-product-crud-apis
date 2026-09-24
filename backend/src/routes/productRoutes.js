const express = require('express');
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const {
  createProductRules,
  updateProductRules,
  productIdParamRule,
  listProductQueryRules
} = require('../validators/productValidator');

const validate = require('../middlewares/validateMiddleware');
const authenticate = require('../middlewares/authMiddleware');

router.get('/', listProductQueryRules, validate, getAllProducts);
router.get('/:id', productIdParamRule, validate, getProductById);

router.post('/', authenticate, createProductRules, validate, createProduct);
router.put('/:id', authenticate, updateProductRules, validate, updateProduct);
router.delete('/:id', authenticate, productIdParamRule, validate, deleteProduct);

module.exports = router;
