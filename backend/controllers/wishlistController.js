const wishlistModel = require('../models/wishlistModel');

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        const existingWishlist = await wishlistModel.findOne({
            user: req.user._id,
            product: productId
        });

        if (existingWishlist) {
            return res.status(400).json({
                success: false,
                message: 'Product already exists in wishlist'
            });
        }

        const wishlist = await wishlistModel.create({
            user: req.user._id,
            product: productId
        });

        res.status(201).json({
            success: true,
            message: 'Product added to wishlist',
            wishlist
        });

    } catch (error) {
        console.error('Add Wishlist Error:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to add product to wishlist'
        });
    }
};


// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        const wishlist = await wishlistModel.findOneAndDelete({
            user: req.user._id,
            product: productId
        });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in wishlist'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product removed from wishlist'
        });

    } catch (error) {
        console.error('Remove Wishlist Error:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to remove product from wishlist'
        });
    }
};


// Get logged-in user's wishlist
exports.getWishlist = async (req, res) => {
    try {
        const wishlist = await wishlistModel
            .find({ user: req.user._id })
            .populate('product');

        res.status(200).json({
            success: true,
            wishlist
        });

    } catch (error) {
        console.error('Get Wishlist Error:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to fetch wishlist'
        });
    }
};