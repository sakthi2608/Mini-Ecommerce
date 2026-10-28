import React, { useState } from "react";
import "./Login.css";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const submitHandler = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                "http://localhost:8000/api/v1/login",
                {
                    method: "POST",
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

                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("userName", data.user.name);
                localStorage.setItem("token", data.token);

                if (location.state?.fromCart) {
                    toast.success("Please login to continue");
                } else {
                    toast.success("Login successful!");
                }

                setTimeout(() => {
                    navigate("/");
                }, 1000);

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="login-page">

            {/* B2B LOGIN NAVBAR */}
            <nav className="login-navbar">

                <div
                    className="login-brand"
                    onClick={() => navigate("/")}
                >
                    <span className="login-brand-name">B2B</span>

                    <span className="login-brand-tagline">
                        BUSINESS • BETTER • TOGETHER
                    </span>
                </div>

            </nav>


            {/* LOGIN CONTENT */}
            <div className="login-container">

                <div className="login-box">

                    <div className="login-icon">
                        B
                    </div>

                    <h2>Welcome Back</h2>

                    <p className="login-welcome">
                        Login to continue shopping with us
                    </p>

                    <div className="login-divider"></div>

                    <h1>Login</h1>


                    <form onSubmit={submitHandler}>

                        <div className="form-group">

                            <label>Email</label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>Password</label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                        </div>


                        <button
                            type="submit"
                            className="login-submit-btn"
                        >
                            Login
                        </button>

                    </form>


                    <p className="forgot-password">

                        <span
                            onClick={() => navigate("/forgot-password")}
                        >
                            Forgot Password?
                        </span>

                    </p>


                    <p className="register-link">

                        Don't have an account?{" "}

                        <span
                            onClick={() => navigate("/register")}
                        >
                            Create Account
                        </span>

                    </p>

                </div>

            </div>

        </div>
    );
};

export default Login;