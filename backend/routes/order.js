const express = require("express");
const router = express.Router();

const {
    createOrder,
    getMyOrders,
    getMyCurrentOrder,
    cancelMyOrder,
    updateOrderStatus,
    getAllOrders
} = require("../controllers/orderController");

const isAuthenticatedUser = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

// ===============================
// CUSTOMER ROUTES
// ===============================

// Create order
router.post(
    "/order",
    isAuthenticatedUser,
    createOrder
);

// Get my orders
router.get(
    "/my-orders",
    isAuthenticatedUser,
    getMyOrders
);

// Get current order
router.get(
    "/my-current-order",
    isAuthenticatedUser,
    getMyCurrentOrder
);

// Cancel my order
router.put(
    "/order/:id/cancel",
    isAuthenticatedUser,
    cancelMyOrder
);


// ===============================
// ADMIN ROUTES
// ===============================

// Get all customer orders
router.get(
    "/admin/orders",
    isAuthenticatedUser,
    isAdmin,
    getAllOrders
);

// Update order status
router.put(
    "/admin/order/:id/status",
    isAuthenticatedUser,
    isAdmin,
    updateOrderStatus
);

module.exports = router;