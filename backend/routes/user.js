const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    sendOTP,
    verifyOTP,
    resetPassword,
    getShippingInfo,
    updateShippingInfo
} = require("../controllers/userController");

const isAuthenticatedUser = require("../middleware/authMiddleware");


router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/forgot-password", sendOTP);

router.post("/verify-otp", verifyOTP);

router.put("/reset-password", resetPassword);


router.get(
    "/shipping-info",
    isAuthenticatedUser,
    getShippingInfo
);

router.put(
    "/shipping-info",
    isAuthenticatedUser,
    updateShippingInfo
);


module.exports = router;