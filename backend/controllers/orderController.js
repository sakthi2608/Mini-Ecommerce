const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");

// =====================================================
// CREATE ORDER
// =====================================================
exports.createOrder = async (req, res, next) => {
    try {
        const {
            cartItems,
            shippingInfo,
            paymentMethod
        } = req.body;

        // Check cart
        if (
            !cartItems ||
            !Array.isArray(cartItems) ||
            cartItems.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty",
            });
        }

        // Check delivery information
        if (
            !shippingInfo ||
            !shippingInfo.name ||
            !shippingInfo.phone ||
            !shippingInfo.address ||
            !shippingInfo.city ||
            !shippingInfo.state ||
            !shippingInfo.pincode
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide complete delivery information",
            });
        }

        // Calculate total amount
        const amount = Number(
            cartItems.reduce(
                (acc, item) =>
                    acc +
                    Number(item.product.price) *
                        Number(item.qty),
                0
            )
        ).toFixed(2);

        // Initial order status
        const status = "pending";

        // Create order
        const order = await orderModel.create({
            user: req.user._id,
            cartItems,
            shippingInfo,
            paymentMethod:
                paymentMethod || "COD",
            amount,
            status,
        });

        // Reduce product stock
        for (const item of cartItems) {
            const product =
                await productModel.findById(
                    item.product._id
                );

            if (product) {
                product.stock =
                    product.stock -
                    Number(item.qty);

                await product.save();
            }
        }

        res.status(201).json({
            success: true,
            message:
                "Order placed successfully",
            order,
        });

    } catch (error) {
        console.error(
            "Create Order Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to place order",
        });
    }
};


// =====================================================
// GET MY ORDERS
// =====================================================
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await orderModel
            .find({
                user: req.user._id,
            })
            .sort({
                createdAt: -1,
            });

        res.status(200).json({
            success: true,
            orders,
        });

    } catch (error) {
        console.error(
            "Get My Orders Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to fetch order history",
        });
    }
};


// =====================================================
// GET MY CURRENT ORDER
// =====================================================
exports.getMyCurrentOrder = async (req, res) => {
    try {
        const currentOrder =
            await orderModel
                .findOne({
                    user: req.user._id,

                    status: {
                        $in: [
                            "pending",
                            "confirmed",
                            "processing",
                            "shipped",
                            "out_for_delivery",
                        ],
                    },
                })
                .sort({
                    createdAt: -1,
                });

        res.status(200).json({
            success: true,
            order: currentOrder,
        });

    } catch (error) {
        console.error(
            "Get Current Order Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to fetch current order",
        });
    }
};


// =====================================================
// ADMIN - UPDATE ORDER STATUS
// =====================================================
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "out_for_delivery",
            "delivered",
        ];

        // Check valid status
        if (
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid order status",
            });
        }

        // Find order
        const order =
            await orderModel.findById(
                req.params.id
            );

        if (!order) {
            return res.status(404).json({
                success: false,
                message:
                    "Order not found",
            });
        }

        // Update status
        order.status = status;

        await order.save();

        res.status(200).json({
            success: true,
            message:
                "Order status updated successfully",
            order,
        });

    } catch (error) {
        console.error(
            "Update Order Status Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to update order status",
        });
    }
};


// =====================================================
// ADMIN - GET ALL ORDERS
// =====================================================
exports.getAllOrders = async (req, res) => {
    try {
        const orders =
            await orderModel
                .find()
                .sort({
                    createdAt: -1,
                });

        res.status(200).json({
            success: true,
            orders,
        });

    } catch (error) {
        console.error(
            "Get All Orders Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to fetch orders",
        });
    }
};


// =====================================================
// CUSTOMER - CANCEL ORDER
// =====================================================
exports.cancelMyOrder = async (req, res) => {
    try {
        // Get cancellation reason
        const { cancelReason } = req.body;

        // Check reason
        if (
            !cancelReason ||
            !cancelReason.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please select a cancellation reason",
            });
        }

        // Find order belonging to logged-in user
        const order =
            await orderModel.findOne({
                _id: req.params.id,
                user: req.user._id,
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message:
                    "Order not found",
            });
        }

        // Customer can cancel only these statuses
        const cancellableStatuses = [
            "pending",
            "confirmed",
        ];

        if (
            !cancellableStatuses.includes(
                order.status
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "This order can no longer be cancelled",
            });
        }

        // Restore product stock
        for (const item of order.cartItems) {
            const product =
                await productModel.findById(
                    item.product._id
                );

            if (product) {
                product.stock =
                    product.stock +
                    Number(item.qty);

                await product.save();
            }
        }

        // Update order
        order.status = "cancelled";

        // Save cancellation reason
        order.cancelReason =
            cancelReason.trim();

        await order.save();

        res.status(200).json({
            success: true,
            message:
                "Order cancelled successfully",
            order,
        });

    } catch (error) {
        console.error(
            "Cancel Order Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to cancel order",
        });
    }
};