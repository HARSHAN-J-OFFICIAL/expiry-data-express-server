const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: [true, 'Product title is required'],
        trim: true,
        maxLength: 150
    },
    upcCode: {
        type: String,
        trim: true,
        default: ''
    },
    amount: {
        type: String,
        trim: true,
        default: '1'
    },
    expiryDate: {
        type: Date,
        required: [true, 'Expiry date is required'],
        index: true
    },
    category: {
        type: String,
        trim: true,
        default: 'General'
    },
    location: {
        type: String,
        enum: ['Fridge', 'Pantry', 'Freezer', 'Medicine Cabinet', 'Countertop', 'Other'],
        default: 'Fridge'
    },
    status: {
        type: String,
        enum: ['active', 'consumed', 'discarded'],
        default: 'active',
        index: true
    }
}, {
    timestamps: true
});

// Compound indexes for efficient pagination, searching & date filtering
productSchema.index({ userId: 1, status: 1, expiryDate: 1 });
productSchema.index({ userId: 1, upcCode: 1 });

module.exports = mongoose.model('Product', productSchema);
