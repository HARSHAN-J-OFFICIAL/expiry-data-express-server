const { validationResult } = require('express-validator');
const productDao = require('../dao/productDao');

const productController = {
    getProducts: async (request, response) => {
        try {
            const userId = request.user._id;
            const { page = 1, limit = 20, search = '', expiryFilter = 'all' } = request.query;

            const result = await productDao.findPaginated({
                userId,
                search,
                expiryFilter,
                page,
                limit
            });

            return response.status(200).json({
                message: 'Products retrieved successfully',
                data: result.products,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Get products error:', error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    getProductById: async (request, response) => {
        try {
            const userId = request.user._id;
            const productId = request.params.id;

            const product = await productDao.findByIdAndUser(productId, userId);
            if (!product) {
                return response.status(404).json({
                    message: 'Product not found'
                });
            }

            return response.status(200).json({
                message: 'Product retrieved successfully',
                product
            });
        } catch (error) {
            console.error('Get product by ID error:', error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    createProduct: async (request, response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return response.status(400).json({
                    errors: errors.array()
                });
            }

            const userId = request.user._id;
            const { title, upcCode, amount, expiryDate, category, location } = request.body;

            const newProduct = await productDao.create({
                userId,
                title,
                upcCode,
                amount,
                expiryDate,
                category,
                location
            });

            return response.status(201).json({
                message: 'Product created successfully',
                product: newProduct
            });
        } catch (error) {
            console.error('Create product error:', error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    updateProduct: async (request, response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return response.status(400).json({
                    errors: errors.array()
                });
            }

            const userId = request.user._id;
            const productId = request.params.id;

            const updatedProduct = await productDao.updateByIdAndUser(productId, userId, request.body);
            if (!updatedProduct) {
                return response.status(404).json({
                    message: 'Product not found or unauthorized'
                });
            }

            return response.status(200).json({
                message: 'Product updated successfully',
                product: updatedProduct
            });
        } catch (error) {
            console.error('Update product error:', error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    deleteProduct: async (request, response) => {
        try {
            const userId = request.user._id;
            const productId = request.params.id;

            const deletedProduct = await productDao.deleteByIdAndUser(productId, userId);
            if (!deletedProduct) {
                return response.status(404).json({
                    message: 'Product not found or unauthorized'
                });
            }

            return response.status(200).json({
                message: 'Product deleted successfully',
                product: deletedProduct
            });
        } catch (error) {
            console.error('Delete product error:', error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    }
};

module.exports = productController;
