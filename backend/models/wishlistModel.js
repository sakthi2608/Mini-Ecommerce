const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: true
        },

        createdAt: {
            type: Date,
            default: Date.now
        }
    }
);

// Same product cannot be added twice by the same user
wishlistSchema.index(
    { user: 1, product: 1 },
    { unique: true }
);

const wishlistModel = mongoose.model('Wishlist', wishlistSchema);

module.exports = wishlistModel;