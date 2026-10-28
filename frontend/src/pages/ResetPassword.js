import React, { useState } from "react";
import "./ResetPassword.css";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ResetPassword = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!passwordRegex.test(password)) {
            toast.error(
                "Password must contain 8 characters, uppercase, lowercase, number and special character"
            );
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:8000/api/v1/reset-password",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (data.success) {

                toast.success(data.message);

                setPassword("");
                setConfirmPassword("");

                navigate("/login");

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
        <div className="reset-page">

            {/* B2B Header */}
            <nav className="reset-navbar">
                <div
                    className="reset-brand"
                    onClick={() => navigate("/")}
                >
                    <span className="reset-brand-name">
                        B2B
                    </span>

                    <span className="reset-brand-tagline">
                        BUSINESS • BETTER • TOGETHER
                    </span>
                </div>
            </nav>

            <div className="reset-container">

                <div className="reset-box">

                    <div className="reset-icon">
                        🔒
                    </div>

                    <h2>Reset Password</h2>

                    <p className="reset-text">
                        Create a new password for your account
                    </p>

                    <div className="reset-divider"></div>

                    <form onSubmit={submitHandler}>

                        <div className="form-group">

                            <label>New Password</label>

                            <input
                                type="password"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>Confirm Password</label>

                            <input
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                required
                            />

                        </div>

                        <button
                            type="submit"
                            className="reset-submit-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Updating..."
                                : "Reset Password"}
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
};

export default ResetPassword;