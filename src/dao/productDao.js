const Product = require('../models/product');

const productDao = {
    create: async (productData) => {
        const product = new Product(productData);
        return await product.save();
    },

    findByIdAndUser: async (productId, userId) => {
        return await Product.findOne({ _id: productId, userId });
    },

    updateByIdAndUser: async (productId, userId, updateData) => {
        return await Product.findOneAndUpdate(
            { _id: productId, userId },
            updateData,
            { new: true, runValidators: true }
        );
    },

    deleteByIdAndUser: async (productId, userId) => {
        return await Product.findOneAndDelete({ _id: productId, userId });
    },

    findPaginated: async ({ userId, search, expiryFilter, page = 1, limit = 20 }) => {
        const query = { userId, status: 'active' };

        // 1. Search filter by title or upcCode
        if (search && search.trim() !== '') {
            const searchRegex = new RegExp(search.trim(), 'i');
            query.$or = [
                { title: searchRegex },
                { upcCode: searchRegex },
                { category: searchRegex }
            ];
        }

        // 2. Expiry date filter
        const now = new Date();
        if (expiryFilter === '1month') {
            const target = new Date();
            target.setMonth(target.getMonth() + 1);
            query.expiryDate = { $gte: now, $lte: target };
        } else if (expiryFilter === '3months') {
            const target = new Date();
            target.setMonth(target.getMonth() + 3);
            query.expiryDate = { $gte: now, $lte: target };
        } else if (expiryFilter === '6months') {
            const target = new Date();
            target.setMonth(target.getMonth() + 6);
            query.expiryDate = { $gte: now, $lte: target };
        } else if (expiryFilter === 'expired') {
            query.expiryDate = { $lt: now };
        }

        // Enforce max limit of 20 per page
        const parsedLimit = Math.min(parseInt(limit, 10) || 20, 20);
        const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
        const skip = (parsedPage - 1) * parsedLimit;

        const [products, totalCount] = await Promise.all([
            Product.find(query)
                .sort({ expiryDate: 1 })
                .skip(skip)
                .limit(parsedLimit),
            Product.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalCount / parsedLimit) || 1;

        return {
            products,
            pagination: {
                totalItems: totalCount,
                totalPages,
                currentPage: parsedPage,
                pageSize: parsedLimit,
                hasNextPage: parsedPage < totalPages,
                hasPrevPage: parsedPage > 1
            }
        };
    }
};

module.exports = productDao;
