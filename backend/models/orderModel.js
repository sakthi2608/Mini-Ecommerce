const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        cartItems: {
            type: Array,
            required: true
        },

        shippingInfo: {
            name: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                required: true
            },
            alternatePhone: {
                type: String,
                default: ""
            },
            address: {
                type: String,
                required: true
            },
            landmark: {
                type: String,
                default: ""
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            pincode: {
                type: String,
                required: true
            }
        },

        paymentMethod: {
            type: String,
            default: "COD"
        },

        amount: {
            type: String,
            required: true
        },

        status: {
            type: String,
            default: "pending"
        },

        createdAt: {
            type: Date,
            default: Date.now
        },

        cancelReason: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const orderModel = mongoose.model(
    "Order",
    orderSchema
);

module.exports = orderModel;