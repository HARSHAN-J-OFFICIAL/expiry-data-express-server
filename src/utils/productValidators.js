const { body } = require('express-validator');

const productValidators = {
    createValidators: [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Product title is required')
            .isLength({ max: 150 })
            .withMessage('Title cannot exceed 150 characters'),
        body('expiryDate')
            .notEmpty()
            .withMessage('Expiry date is required')
            .isISO8601()
            .withMessage('Expiry date must be a valid date'),
        body('upcCode')
            .optional()
            .trim(),
        body('amount')
            .optional()
            .trim(),
        body('category')
            .optional()
            .trim(),
        body('location')
            .optional()
            .isIn(['Fridge', 'Pantry', 'Freezer', 'Medicine Cabinet', 'Countertop', 'Other'])
            .withMessage('Invalid location specified')
    ],

    updateValidators: [
        body('title')
            .optional()
            .trim()
            .notEmpty()
            .withMessage('Product title cannot be empty')
            .isLength({ max: 150 })
            .withMessage('Title cannot exceed 150 characters'),
        body('expiryDate')
            .optional()
            .isISO8601()
            .withMessage('Expiry date must be a valid date'),
        body('upcCode')
            .optional()
            .trim(),
        body('amount')
            .optional()
            .trim(),
        body('category')
            .optional()
            .trim(),
        body('location')
            .optional()
            .isIn(['Fridge', 'Pantry', 'Freezer', 'Medicine Cabinet', 'Countertop', 'Other'])
            .withMessage('Invalid location specified')
    ]
};

module.exports = productValidators;
