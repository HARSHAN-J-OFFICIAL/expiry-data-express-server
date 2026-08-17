const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const { createValidators, updateValidators } = require('../utils/productValidators');

const router = express.Router();

// Apply Auth Middleware to all Product routes
router.use(authMiddleware.protect);

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Retrieve paginated user products with optional search & expiry date filters
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 20
 *         description: Number of items per page (max 20)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword matching product title or UPC code
 *       - in: query
 *         name: expiryFilter
 *         schema:
 *           type: string
 *           enum: [all, 1month, 3months, 6months, expired]
 *           default: all
 *         description: Filter items by expiry timeframe
 *     responses:
 *       200:
 *         description: Paginated product list
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', productController.getProducts);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     summary: Get single product by ID
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', productController.getProductById);

/**
 * @openapi
 * /products:
 *   post:
 *     summary: Add a new product to inventory
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - expiryDate
 *             properties:
 *               title:
 *                 type: string
 *                 example: Organic Whole Milk 1L
 *               upcCode:
 *                 type: string
 *                 example: 073210001234
 *               amount:
 *                 type: string
 *                 example: 2 bottles
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-09-01
 *               category:
 *                 type: string
 *                 example: Dairy
 *               location:
 *                 type: string
 *                 example: Fridge
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', createValidators, productController.createProduct);

/**
 * @openapi
 * /products/{id}:
 *   put:
 *     summary: Update an existing product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               upcCode:
 *                 type: string
 *               amount:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               category:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', updateValidators, productController.updateProduct);

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', productController.deleteProduct);

module.exports = router;
