const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Get saved shipping information
exports.getShippingInfo = async (req, res) => {
    try {

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const shippingInfo = user.shippingInfo;

        // No address saved yet
        if (
            !shippingInfo ||
            !shippingInfo.phone ||
            !shippingInfo.address
        ) {
            return res.status(200).json({
                success: true,
                hasAddress: false,
                shippingInfo: null
            });
        }

        res.status(200).json({
            success: true,
            hasAddress: true,
            shippingInfo
        });

    } catch (error) {

        console.error("Get Shipping Info Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load delivery information"
        });
    }
};

// Save / update shipping information
exports.updateShippingInfo = async (req, res) => {
    try {

        const {
            name,
            phone,
            alternatePhone,
            address,
            landmark,
            city,
            state,
            pincode
        } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.shippingInfo = {
            name,
            phone,
            alternatePhone: alternatePhone || "",
            address,
            landmark: landmark || "",
            city,
            state,
            pincode
        };

        await user.save();

        res.status(200).json({
            success: true,
            message: "Delivery address saved successfully",
            shippingInfo: user.shippingInfo
        });

    } catch (error) {

        console.error("Update Shipping Info Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to save delivery information"
        });
    }
};


exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!passwordRegex.test(password)) {
    return res.status(400).json({
        success: false,
        message:
            "Password must contain 8 characters, uppercase, lowercase, number and special character"
    });
}

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            message: "Your account was successfully created"
        });

    } catch (error) {

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "This email is already registered. Please login instead."
            });
        }

        res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        });
    }
};


exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isPasswordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
);

res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
        id: user._id,
        name: user.name,
        email: user.email
    }
});




    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        });
    }
};

exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email."
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetOTP = otp;
        user.resetOTPExpire = new Date(Date.now() + 2 * 60 * 1000);

        await user.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "JVLcart Password Reset OTP",
            text: `Your JVLcart password reset OTP is ${otp}. It is valid for 5 minutes.`
        });

        res.status(200).json({
            success: true,
            message: "OTP sent successfully to your email."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to send OTP. Please try again."
        });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email."
            });
        }

        if (!user.resetOTP || !user.resetOTPExpire) {
            return res.status(400).json({
                success: false,
                message: "Please request a new OTP."
            });
        }

        if (new Date() > user.resetOTPExpire) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP."
            });
        }

        if (user.resetOTP !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please try again."
            });
        }

        // OTP is correct
        user.resetOTP = undefined;
        user.resetOTPExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: "OTP verified successfully."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!passwordRegex.test(password)) {
    return res.status(400).json({
        success: false,
        message:
            "Password must contain 8 characters, uppercase, lowercase, number and special character"
    });
}

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successfully. Please login."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        });
    }
};