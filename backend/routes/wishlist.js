const express = require("express");

const router = express.Router();

const {
    addToWishlist,
    removeFromWishlist,
    getWishlist
} = require("../controllers/wishlistController");

const isAuthenticatedUser = require("../middleware/authMiddleware");


router.post(
    "/wishlist",
    isAuthenticatedUser,
    addToWishlist
);


router.get(
    "/wishlist",
    isAuthenticatedUser,
    getWishlist
);


router.delete(
    "/wishlist/:productId",
    isAuthenticatedUser,
    removeFromWishlist
);


module.exports = router;