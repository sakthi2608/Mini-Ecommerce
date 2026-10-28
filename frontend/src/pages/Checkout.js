import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Checkout.css";

export default function Checkout({ cartItems, setCartItems }) {

    const navigate = useNavigate();

    const token = localStorage.getItem("token");


    // Delivery information
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [alternatePhone, setAlternatePhone] = useState("");
    const [address, setAddress] = useState("");
    const [landmark, setLandmark] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [pincode, setPincode] = useState("");


    const [paymentMethod, setPaymentMethod] = useState("COD");

    const [loading, setLoading] = useState(false);

    // Address states
    const [addressLoading, setAddressLoading] = useState(true);
    const [hasSavedAddress, setHasSavedAddress] = useState(false);
    const [changeAddress, setChangeAddress] = useState(false);


    const totalAmount = cartItems.reduce(
        (acc, item) =>
            acc + Number(item.product.price) * item.qty,
        0
    );


    // Load saved address
    useEffect(() => {

        const loadShippingInfo = async () => {

            if (!token) {
                setAddressLoading(false);
                return;
            }

            try {

                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/shipping-info`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (response.ok && data.hasAddress) {

                    const info = data.shippingInfo;

                    setName(info.name || "");
                    setPhone(info.phone || "");
                    setAlternatePhone(
                        info.alternatePhone || ""
                    );
                    setAddress(info.address || "");
                    setLandmark(info.landmark || "");
                    setCity(info.city || "");
                    setState(info.state || "");
                    setPincode(info.pincode || "");

                    setHasSavedAddress(true);

                } else {

                    setHasSavedAddress(false);
                    setChangeAddress(true);

                }

            } catch (error) {

                console.error(
                    "Shipping Info Error:",
                    error
                );

                setHasSavedAddress(false);
                setChangeAddress(true);

            } finally {

                setAddressLoading(false);

            }
        };

        loadShippingInfo();

    }, [token]);


    // Place order
    const placeOrderHandler = async (e) => {

        e.preventDefault();


        if (!token) {

            toast.info("Please login to continue");

            navigate("/login", {
                state: {
                    fromCart: true
                }
            });

            return;
        }


        if (phone.length !== 10) {

            toast.error(
                "Please enter a valid 10-digit phone number"
            );

            return;
        }


        if (
            alternatePhone &&
            alternatePhone.length !== 10
        ) {

            toast.error(
                "Please enter a valid alternate contact number"
            );

            return;
        }


        if (
            alternatePhone &&
            alternatePhone === phone
        ) {

            toast.error(
                "Alternate number must be different from phone number"
            );

            return;
        }


        if (pincode.length !== 6) {

            toast.error(
                "Please enter a valid 6-digit pincode"
            );

            return;
        }


        try {

            setLoading(true);


            // Save/update address
            const addressResponse = await fetch(
                `${process.env.REACT_APP_API_URL}/shipping-info`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        name,
                        phone,
                        alternatePhone,
                        address,
                        landmark,
                        city,
                        state,
                        pincode
                    })
                }
            );


            const addressData =
                await addressResponse.json();


            if (!addressResponse.ok) {

                toast.error(
                    addressData.message ||
                    "Unable to save delivery address"
                );

                return;
            }


            // Place order
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/order`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        cartItems,

                        shippingInfo: {
                            name,
                            phone,
                            alternatePhone,
                            address,
                            landmark,
                            city,
                            state,
                            pincode
                        },

                        paymentMethod

                    })
                }
            );


            const data = await response.json();


            if (response.ok) {

                setCartItems([]);

                toast.success(
                    "Order placed successfully!"
                );

                setTimeout(() => {

                    navigate("/");

                }, 1200);

            } else {

                toast.error(
                    data.message ||
                    "Unable to place order"
                );

            }

        } catch (error) {

            console.error(
                "Checkout Error:",
                error
            );

            toast.error(
                "Something went wrong. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };


    // Loading address
    if (addressLoading) {

        return (
            <div className="checkout-page">

                <div className="checkout-container">

                    <div className="checkout-heading">

                        <h1>Checkout</h1>

                        <p>
                            Loading your delivery information...
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    return (

        <div className="checkout-page">


            {/* Header */}

            <div className="checkout-navbar">

                <div
                    className="checkout-logo"
                    onClick={() => navigate("/")}
                >

                    <span className="checkout-brand-name">
                        B2B
                    </span>

                    <span className="checkout-brand-tagline">
                        BUSINESS • BETTER • TOGETHER
                    </span>

                </div>


                <div
                    className="checkout-back"
                    onClick={() => navigate("/")}
                >
                    ← Continue Shopping
                </div>

            </div>


            {/* Main */}

            <div className="checkout-container">


                <div className="checkout-heading">

                    <h1>Checkout</h1>

                    <p>
                        Complete your order with your
                        delivery details.
                    </p>

                </div>


                <div className="checkout-layout">


                    {/* LEFT */}

                    <div className="checkout-main">

                        <div className="checkout-box">


                            {/* DELIVERY */}

                            <div className="checkout-section-title">

                                <div className="section-number">
                                    01
                                </div>

                                <div>

                                    <h3>
                                        Delivery Information
                                    </h3>

                                    <p>
                                        Where should we deliver
                                        your order?
                                    </p>

                                </div>

                            </div>


                            {/* SAVED ADDRESS */}

                            {hasSavedAddress &&
                            !changeAddress ? (

                                <div className="saved-address-box">

                                    <div className="saved-address-top">

                                        <div>

                                            <span className="saved-address-label">
                                                DELIVERY ADDRESS
                                            </span>

                                            <h4>
                                                {name}
                                            </h4>

                                        </div>

                                        <span className="saved-address-badge">
                                            Saved
                                        </span>

                                    </div>


                                    <div className="saved-address-details">

                                        <p>
                                            📞 {phone}
                                        </p>

                                        {alternatePhone && (
                                            <p>
                                                📞 {alternatePhone}
                                            </p>
                                        )}

                                        <p>
                                            {address}
                                        </p>

                                        {landmark && (
                                            <p>
                                                {landmark}
                                            </p>
                                        )}

                                        <p>
                                            {city}, {state} - {pincode}
                                        </p>

                                    </div>


                                    <button
                                        type="button"
                                        className="change-address-btn"
                                        onClick={() =>
                                            setChangeAddress(true)
                                        }
                                    >
                                        Change your address
                                    </button>

                                </div>

                            ) : (

                                /* ADDRESS FORM */

                                <form
                                    onSubmit={
                                        placeOrderHandler
                                    }
                                >


                                    {/* Name */}

                                    <div className="checkout-form-group">

                                        <label>
                                            Full Name
                                        </label>

                                        <input
                                            type="text"
                                            placeholder="Enter your full name"
                                            value={name}
                                            onChange={(e) =>
                                                setName(
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />

                                    </div>


                                    {/* Phone */}

                                    <div className="checkout-form-row">

                                        <div className="checkout-form-group">

                                            <label>
                                                Phone Number
                                                <span className="required-mark">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="tel"
                                                placeholder="10-digit mobile number"
                                                value={phone}
                                                onChange={(e) =>
                                                    setPhone(
                                                        e.target.value.replace(
                                                            /\D/g,
                                                            ""
                                                        )
                                                    )
                                                }
                                                maxLength="10"
                                                required
                                            />

                                        </div>


                                        <div className="checkout-form-group">

                                            <label>

                                                Alternate Contact

                                                <span className="optional-text">
                                                    Optional
                                                </span>

                                            </label>

                                            <input
                                                type="tel"
                                                placeholder="Second contact number"
                                                value={
                                                    alternatePhone
                                                }
                                                onChange={(e) =>
                                                    setAlternatePhone(
                                                        e.target.value.replace(
                                                            /\D/g,
                                                            ""
                                                        )
                                                    )
                                                }
                                                maxLength="10"
                                            />

                                        </div>

                                    </div>


                                    {/* Address */}

                                    <div className="checkout-form-group">

                                        <label>
                                            Delivery Address
                                        </label>

                                        <textarea
                                            placeholder="House / Flat No, Street, Area"
                                            value={address}
                                            onChange={(e) =>
                                                setAddress(
                                                    e.target.value
                                                )
                                            }
                                            rows="3"
                                            required
                                        />

                                    </div>


                                    {/* Landmark */}

                                    <div className="checkout-form-group">

                                        <label>

                                            Landmark

                                            <span className="optional-text">
                                                Optional
                                            </span>

                                        </label>

                                        <input
                                            type="text"
                                            placeholder="e.g. Near Bus Stand, Temple, School"
                                            value={landmark}
                                            onChange={(e) =>
                                                setLandmark(
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>


                                    {/* City State */}

                                    <div className="checkout-form-row">

                                        <div className="checkout-form-group">

                                            <label>
                                                City
                                            </label>

                                            <input
                                                type="text"
                                                placeholder="Enter your city"
                                                value={city}
                                                onChange={(e) =>
                                                    setCity(
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />

                                        </div>


                                        <div className="checkout-form-group">

                                            <label>
                                                State
                                            </label>

                                            <input
                                                type="text"
                                                placeholder="Enter your state"
                                                value={state}
                                                onChange={(e) =>
                                                    setState(
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />

                                        </div>

                                    </div>


                                    {/* Pincode */}

                                    <div className="checkout-form-group checkout-pincode">

                                        <label>
                                            Pincode
                                        </label>

                                        <input
                                            type="text"
                                            placeholder="6-digit pincode"
                                            value={pincode}
                                            onChange={(e) =>
                                                setPincode(
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        ""
                                                    )
                                                )
                                            }
                                            maxLength="6"
                                            required
                                        />

                                    </div>


                                    {hasSavedAddress && (
                                        <button
                                            type="button"
                                            className="cancel-address-btn"
                                            onClick={() =>
                                                setChangeAddress(false)
                                            }
                                        >
                                            Use Saved Address
                                        </button>
                                    )}


                                    {/* PAYMENT */}

                                    <div className="checkout-payment-section">

                                        <div className="checkout-section-title">

                                            <div className="section-number">
                                                02
                                            </div>

                                            <div>

                                                <h3>
                                                    Payment Method
                                                </h3>

                                                <p>
                                                    Select your preferred
                                                    payment option.
                                                </p>

                                            </div>

                                        </div>


                                        <label
                                            htmlFor="cod"
                                            className={`payment-card ${
                                                paymentMethod ===
                                                "COD"
                                                    ? "payment-selected"
                                                    : ""
                                            }`}
                                        >

                                            <input
                                                type="radio"
                                                id="cod"
                                                name="payment"
                                                value="COD"
                                                checked={
                                                    paymentMethod ===
                                                    "COD"
                                                }
                                                onChange={(e) =>
                                                    setPaymentMethod(
                                                        e.target.value
                                                    )
                                                }
                                            />

                                            <div className="payment-radio"></div>

                                            <div className="payment-content">

                                                <div className="payment-title">
                                                    Cash on Delivery
                                                </div>

                                                <div className="payment-description">
                                                    Pay securely when your
                                                    order arrives at your
                                                    doorstep.
                                                </div>

                                            </div>

                                            <div className="payment-badge">
                                                COD
                                            </div>

                                        </label>

                                    </div>


                                    {/* Mobile */}

                                    <button
                                        type="submit"
                                        className="place-order-btn mobile-order-btn"
                                        disabled={loading}
                                    >

                                        {loading
                                            ? "Placing Order..."
                                            : `Place Order • ₹${totalAmount.toFixed(
                                                  2
                                              )}`}

                                    </button>

                                </form>

                            )}


                            {/* PAYMENT FOR SAVED ADDRESS */}

                            {hasSavedAddress &&
                            !changeAddress && (

                                <div className="saved-payment-section">

                                    <div className="checkout-payment-section">

                                        <div className="checkout-section-title">

                                            <div className="section-number">
                                                02
                                            </div>

                                            <div>

                                                <h3>
                                                    Payment Method
                                                </h3>

                                                <p>
                                                    Select your preferred
                                                    payment option.
                                                </p>

                                            </div>

                                        </div>


                                        <label
                                            htmlFor="saved-cod"
                                            className="payment-card payment-selected"
                                        >

                                            <input
                                                type="radio"
                                                id="saved-cod"
                                                name="saved-payment"
                                                value="COD"
                                                checked
                                                readOnly
                                            />

                                            <div className="payment-radio"></div>

                                            <div className="payment-content">

                                                <div className="payment-title">
                                                    Cash on Delivery
                                                </div>

                                                <div className="payment-description">
                                                    Pay securely when your
                                                    order arrives at your
                                                    doorstep.
                                                </div>

                                            </div>

                                            <div className="payment-badge">
                                                COD
                                            </div>

                                        </label>

                                    </div>


                                    <button
                                        type="button"
                                        className="place-order-btn mobile-order-btn"
                                        disabled={loading}
                                        onClick={placeOrderHandler}
                                    >
                                        {loading
                                            ? "Placing Order..."
                                            : `Place Order • ₹${totalAmount.toFixed(
                                                  2
                                              )}`}
                                    </button>

                                </div>

                            )}

                        </div>

                    </div>


                    {/* RIGHT SIDE */}

                    <div className="checkout-sidebar">

                        <div className="checkout-summary">

                            <div className="summary-heading">

                                <div>

                                    <h3>
                                        Order Summary
                                    </h3>

                                    <p>
                                        {cartItems.length}{" "}
                                        {cartItems.length === 1
                                            ? "item"
                                            : "items"}
                                    </p>

                                </div>

                            </div>


                            <div className="summary-products">

                                {cartItems.map((item) => (

                                    <div
                                        className="summary-item"
                                        key={
                                            item.product._id
                                        }
                                    >

                                        <div className="summary-product-info">

                                            <div className="summary-product-image">

                                                {item.product.images?.[0] ? (

                                                    <img
                                                        src={
                                                            item.product
                                                                .images[0]
                                                                .image
                                                        }
                                                        alt={
                                                            item.product.name
                                                        }
                                                    />

                                                ) : (

                                                    <span>
                                                        {item.product.name
                                                            ?.charAt(
                                                                0
                                                            )
                                                            ?.toUpperCase()}
                                                    </span>

                                                )}

                                            </div>


                                            <div className="summary-product-details">

                                                <h4>
                                                    {item.product.name}
                                                </h4>

                                                <p>
                                                    Qty: {item.qty}
                                                </p>

                                            </div>

                                        </div>


                                        <span className="summary-price">

                                            ₹
                                            {(
                                                Number(
                                                    item.product
                                                        .price
                                                ) *
                                                item.qty
                                            ).toFixed(2)}

                                        </span>

                                    </div>

                                ))}

                            </div>


                            <div className="summary-divider"></div>


                            <div className="summary-row">

                                <span>
                                    Subtotal
                                </span>

                                <span>
                                    ₹
                                    {totalAmount.toFixed(2)}
                                </span>

                            </div>


                            <div className="summary-row">

                                <span>
                                    Delivery
                                </span>

                                <span className="free-text">
                                    FREE
                                </span>

                            </div>


                            <div className="summary-divider"></div>


                            <div className="summary-total">

                                <span>
                                    Total
                                </span>

                                <span>
                                    ₹
                                    {totalAmount.toFixed(2)}
                                </span>

                            </div>


                            <div className="summary-payment">

                                <span className="payment-check">
                                    ✓
                                </span>

                                <span>
                                    Cash on Delivery selected
                                </span>

                            </div>


                            <button
                                type="button"
                                className="place-order-btn desktop-order-btn"
                                disabled={loading}
                                onClick={() => {

                                    if (
                                        hasSavedAddress &&
                                        !changeAddress
                                    ) {

                                        placeOrderHandler({
                                            preventDefault: () => {}
                                        });

                                    } else {

                                        document
                                            .querySelector(
                                                ".checkout-main form"
                                            )
                                            ?.requestSubmit();

                                    }

                                }}
                            >

                                {loading
                                    ? "Placing Order..."
                                    : "Place Order"}

                            </button>


                            <p className="secure-note">
                                🔒 Your order information is secure
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}