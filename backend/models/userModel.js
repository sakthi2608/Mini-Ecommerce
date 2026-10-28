const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    // Admin permission
    isAdmin: {
        type: Boolean,
        default: false
    },

    shippingInfo: {
        name: {
            type: String,
            default: ""
        },

        phone: {
            type: String,
            default: ""
        },

        alternatePhone: {
            type: String,
            default: ""
        },

        address: {
            type: String,
            default: ""
        },

        landmark: {
            type: String,
            default: ""
        },

        city: {
            type: String,
            default: ""
        },

        state: {
            type: String,
            default: ""
        },

        pincode: {
            type: String,
            default: ""
        }
    },

    resetOTP: {
        type: String
    },

    resetOTPExpire: {
        type: Date
    }

});

module.exports = mongoose.model("User", userSchema);