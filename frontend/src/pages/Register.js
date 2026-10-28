import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Register.css';
import { toast } from 'react-toastify';

const Register = () => {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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
            const response = await fetch(
                "http://localhost:8000/api/v1/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (data.success) {
                toast.success("Your account was successfully created!");

                setName("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");

                setTimeout(() => {
                    navigate("/");
                }, 1500);
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error("Something went wrong. Please try again.");
            console.log(error);
        }
    };

    return (
        <div className="register-page">

            {/* B2B Header */}
            <nav className="register-navbar">
                <div
                    className="register-brand"
                    onClick={() => navigate("/")}
                >
                    <span className="register-brand-name">
                        B2B
                    </span>

                    <span className="register-brand-tagline">
                        BUSINESS • BETTER • TOGETHER
                    </span>
                </div>
            </nav>

            <div className="register-container">

                <div className="register-box">

                    {/* B2B Icon */}
                    <div className="register-icon">
                        B
                    </div>

                    <h2>Welcome to B2B</h2>

                    <p className="welcome-text">
                        Create your account to start shopping with us
                    </p>

                    <div className="register-divider"></div>

                    <h1>Create Account</h1>

                    <form onSubmit={submitHandler}>

                        <div className="form-group">
                            <label>Name</label>

                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

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
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm Password</label>

                            <input
                                type="password"
                                placeholder="Confirm password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="register-submit-btn"
                        >
                            Create Account
                        </button>

                        <p className="login-link">
                            Already have an account?{" "}
                            <span onClick={() => navigate("/login")}>
                                Login
                            </span>
                        </p>

                    </form>

                </div>

            </div>

        </div>
    );
};

export default Register;