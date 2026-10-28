import React, { useState } from "react";
import "./VerifyOTP.css";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const VerifyOTP = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || "";

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();

        if (otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:8000/api/v1/verify-otp",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        otp
                    })
                }
            );

            const data = await response.json();

            if (data.success) {

                toast.success(data.message);

                navigate("/reset-password", {
                    state: { email }
                });

            } else {
                toast.error(data.message);
            }

        } catch (error) {

            toast.error(
                "Something went wrong. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="verify-page">

            {/* B2B Header */}
            <nav className="verify-navbar">
                <div
                    className="verify-brand"
                    onClick={() => navigate("/")}
                >
                    <span className="verify-brand-name">
                        B2B
                    </span>

                    <span className="verify-brand-tagline">
                        BUSINESS • BETTER • TOGETHER
                    </span>
                </div>
            </nav>

            <div className="verify-container">

                <div className="verify-box">

                    <div className="verify-icon">
                        ✓
                    </div>

                    <h2>Verify OTP</h2>

                    <p className="verify-text">
                        Enter the 6-digit OTP sent to your email
                    </p>

                    <p className="verify-email">
                        {email}
                    </p>

                    <div className="verify-divider"></div>

                    <form onSubmit={submitHandler}>

                        <div className="form-group">

                            <label>OTP</label>

                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength="6"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) =>
                                    setOtp(
                                        e.target.value.replace(/\D/g, "")
                                    )
                                }
                                required
                            />

                        </div>

                        <button
                            type="submit"
                            className="verify-submit-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Verifying..."
                                : "Verify OTP"}
                        </button>

                    </form>

                    <p className="back-login">
                        Remember your password?{" "}
                        <span onClick={() => navigate("/login")}>
                            Login
                        </span>
                    </p>

                </div>

            </div>

        </div>
    );
};

export default VerifyOTP;