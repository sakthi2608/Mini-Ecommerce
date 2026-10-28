import React, { useState } from "react";
import "./ForgotPassword.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ForgotPassword = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:8000/api/v1/forgot-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email
                    })
                }
            );

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);

                navigate("/verify-otp", {
                    state: { email }
                });
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-page">

            {/* B2B Header */}
            <nav className="forgot-navbar">
                <div
                    className="forgot-brand"
                    onClick={() => navigate("/")}
                >
                    <span className="forgot-brand-name">
                        B2B
                    </span>

                    <span className="forgot-brand-tagline">
                        BUSINESS • BETTER • TOGETHER
                    </span>
                </div>
            </nav>

            <div className="forgot-container">

                <div className="forgot-box">

                    <div className="forgot-icon">
                        ?
                    </div>

                    <h2>Forgot Password?</h2>

                    <p className="forgot-text">
                        Enter your registered email to receive an OTP
                    </p>

                    <div className="forgot-divider"></div>

                    <form onSubmit={submitHandler}>

                        <div className="form-group">
                            <label>Email</label>

                            <input
                                type="email"
                                placeholder="Enter your registered email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="forgot-submit-btn"
                            disabled={loading}
                        >
                            {loading ? "Sending OTP..." : "Send OTP"}
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

export default ForgotPassword;