import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./OrderDetails.css";

const API_URL =
    process.env.REACT_APP_API_URL ||
    "http://localhost:8000/api/v1";

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    // Cancellation states
    const [showCancelModal, setShowCancelModal] =
        useState(false);

    const [selectedReason, setSelectedReason] =
        useState("");

    const [otherReason, setOtherReason] =
        useState("");

    const token = localStorage.getItem("token");

    // =====================================================
    // CANCELLATION REASONS
    // =====================================================

    const cancellationReasons = [
        "Ordered by mistake",
        "Found a better price elsewhere",
        "Delivery is taking too long",
        "No longer need the product",
        "Want to change the product",
        "Want to change the delivery address",
        "Payment-related issue",
        "Ordered the wrong quantity",
        "Entered incorrect order details",
        "Changed my mind",
    ];

    // =====================================================
    // FETCH ORDER
    // =====================================================

    useEffect(() => {
        fetchOrder();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                `${API_URL}/my-orders`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                const selectedOrder =
                    data.orders.find(
                        (item) => item._id === id
                    );

                if (selectedOrder) {
                    setOrder(selectedOrder);
                } else {
                    toast.error("Order not found");
                    navigate("/dashboard");
                }
            } else {
                toast.error(
                    data.message ||
                        "Unable to fetch order details"
                );
            }

        } catch (error) {
            console.error(
                "Order Details Error:",
                error
            );

            toast.error(
                "Something went wrong"
            );

        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // FORMAT STATUS
    // =====================================================

    const formatStatus = (status) => {
        if (!status) return "Pending";

        return status
            .replaceAll("_", " ")
            .replace(
                /\b\w/g,
                (letter) =>
                    letter.toUpperCase()
            );
    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric",
            }
        );
    };

    // =====================================================
    // PRODUCT IMAGE
    // =====================================================

    const getProductImage = (item) => {
        return (
            item?.product?.images?.[0]?.image ||
            "/images/default-product.png"
        );
    };

    // =====================================================
    // PRODUCT NAME
    // =====================================================

    const getProductName = (item) => {
        return (
            item?.product?.name ||
            "Product"
        );
    };

    // =====================================================
    // OPEN CANCEL MODAL
    // =====================================================

    const openCancelModal = () => {
        setSelectedReason("");
        setOtherReason("");
        setShowCancelModal(true);
    };

    // =====================================================
    // CLOSE CANCEL MODAL
    // =====================================================

    const closeCancelModal = () => {
        if (cancelling) return;

        setShowCancelModal(false);
        setSelectedReason("");
        setOtherReason("");
    };

    // =====================================================
    // CONFIRM CANCEL ORDER
    // =====================================================

    const confirmCancelOrder = async () => {
        if (!order) return;

        let finalReason = selectedReason;

        // If Other selected
        if (selectedReason === "Other reason") {
            finalReason = otherReason.trim();
        }

        // Check reason
        if (!finalReason) {
            toast.error(
                "Please select a cancellation reason"
            );
            return;
        }

        // Other reason minimum check
        if (
            selectedReason === "Other reason" &&
            finalReason.length < 3
        ) {
            toast.error(
                "Please enter a valid cancellation reason"
            );
            return;
        }

        try {
            setCancelling(true);

            const response = await fetch(
                `${API_URL}/order/${order._id}/cancel`,
                {
                    method: "PUT",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        cancelReason:
                            finalReason,
                    }),
                }
            );

            const data =
                await response.json();

            if (
                response.ok &&
                data.success
            ) {
                toast.success(
                    "Order cancelled successfully"
                );

                setShowCancelModal(false);

                setOrder(data.order);

                setSelectedReason("");
                setOtherReason("");

                setTimeout(() => {
                    navigate("/dashboard");
                }, 1000);

            } else {
                toast.error(
                    data.message ||
                        "Unable to cancel order"
                );
            }

        } catch (error) {
            console.error(
                "Cancel Order Error:",
                error
            );

            toast.error(
                "Something went wrong. Please try again."
            );

        } finally {
            setCancelling(false);
        }
    };

    // =====================================================
    // CANCEL ALLOWED ONLY FOR
    // PENDING / CONFIRMED
    // =====================================================

    const canCancel =
        order &&
        ["pending", "confirmed"].includes(
            order.status
        );

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="order-details-loading">

                <div className="order-details-spinner"></div>

                <p>
                    Loading order details...
                </p>

            </div>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <div className="order-details-page">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="order-details-header">

                <button
                    className="back-orders-btn"
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    ← Back to My Orders
                </button>

                <div>

                    <span>
                        ORDER DETAILS
                    </span>

                    <h1>
                        #
                        {order._id
                            .slice(-8)
                            .toUpperCase()}
                    </h1>

                </div>

            </div>


            {/* =====================================================
                STATUS
            ===================================================== */}

            <section className="order-status-card">

                <div>

                    <span className="details-label">
                        CURRENT STATUS
                    </span>

                    <h2
                        className={`details-status status-${order.status}`}
                    >
                        {formatStatus(
                            order.status
                        )}
                    </h2>

                </div>


                <div className="order-date-box">

                    <span className="details-label">
                        ORDERED ON
                    </span>

                    <strong>
                        {formatDate(
                            order.createdAt
                        )}
                    </strong>

                </div>

            </section>


            {/* =====================================================
                SHOW CANCELLATION REASON
            ===================================================== */}

            {order.status === "cancelled" &&
                order.cancelReason && (

                    <section className="cancelled-reason-card">

                        <div className="cancelled-reason-icon">
                            !
                        </div>

                        <div>

                            <span>
                                CANCELLATION REASON
                            </span>

                            <p>
                                {
                                    order.cancelReason
                                }
                            </p>

                        </div>

                    </section>
                )}


            {/* =====================================================
                PRODUCTS
            ===================================================== */}

            <section className="order-details-card">

                <div className="details-card-title">

                    <h2>
                        Products
                    </h2>

                    <span>
                        {
                            order.cartItems.length
                        }{" "}
                        {
                            order.cartItems
                                .length === 1
                                ? "Item"
                                : "Items"
                        }
                    </span>

                </div>


                <div className="details-products">

                    {order.cartItems.map(
                        (item, index) => {

                            const product =
                                item.product;

                            return (
                                <div
                                    className="details-product"
                                    key={
                                        product?._id ||
                                        index
                                    }
                                >

                                    <div className="details-product-image">

                                        <img
                                            src={getProductImage(
                                                item
                                            )}
                                            alt={getProductName(
                                                item
                                            )}
                                            onError={(
                                                e
                                            ) => {
                                                e.target.src =
                                                    "/images/default-product.png";
                                            }}
                                        />

                                    </div>


                                    <div className="details-product-info">

                                        <h3>
                                            {
                                                getProductName(
                                                    item
                                                )
                                            }
                                        </h3>

                                        <p>
                                            Quantity:{" "}
                                            {
                                                item.qty
                                            }
                                        </p>

                                    </div>


                                    <div className="details-product-price">

                                        <span>
                                            ₹
                                            {Number(
                                                product?.price ||
                                                    0
                                            ).toFixed(
                                                2
                                            )}
                                        </span>

                                        <small>
                                            ₹
                                            {(
                                                Number(
                                                    product?.price ||
                                                        0
                                                ) *
                                                Number(
                                                    item.qty ||
                                                        0
                                                )
                                            ).toFixed(
                                                2
                                            )}
                                        </small>

                                    </div>

                                </div>
                            );
                        }
                    )}

                </div>

            </section>


            {/* =====================================================
                DELIVERY + PAYMENT
            ===================================================== */}

            <div className="details-two-column">

                {/* DELIVERY */}

                <section className="order-details-card">

                    <div className="details-card-title">

                        <h2>
                            Delivery Address
                        </h2>

                    </div>


                    <div className="delivery-details">

                        <strong>
                            {
                                order.shippingInfo
                                    ?.name
                            }
                        </strong>

                        <p>
                            {
                                order.shippingInfo
                                    ?.address
                            }
                        </p>

                        {order.shippingInfo
                            ?.landmark && (
                            <p>
                                Landmark:{" "}
                                {
                                    order
                                        .shippingInfo
                                        .landmark
                                }
                            </p>
                        )}

                        <p>
                            {
                                order.shippingInfo
                                    ?.city
                            }
                            ,{" "}
                            {
                                order.shippingInfo
                                    ?.state
                            }
                        </p>

                        <p>
                            PIN -{" "}
                            {
                                order.shippingInfo
                                    ?.pincode
                            }
                        </p>

                        <p>
                            Phone:{" "}
                            {
                                order.shippingInfo
                                    ?.phone
                            }
                        </p>

                        {order.shippingInfo
                            ?.alternatePhone && (
                            <p>
                                Alternate:{" "}
                                {
                                    order
                                        .shippingInfo
                                        .alternatePhone
                                }
                            </p>
                        )}

                    </div>

                </section>


                {/* PAYMENT */}

                <section className="order-details-card">

                    <div className="details-card-title">

                        <h2>
                            Payment Summary
                        </h2>

                    </div>


                    <div className="payment-details">

                        <div>

                            <span>
                                Payment Method
                            </span>

                            <strong>
                                {
                                    order.paymentMethod ||
                                    "COD"
                                }
                            </strong>

                        </div>


                        <div className="payment-total">

                            <span>
                                Order Total
                            </span>

                            <strong>
                                ₹{order.amount}
                            </strong>

                        </div>

                    </div>

                </section>

            </div>


            {/* =====================================================
                TRACKING
            ===================================================== */}

            {order.status !== "cancelled" && (

                <section className="order-details-card">

                    <div className="details-card-title">

                        <h2>
                            Order Tracking
                        </h2>

                    </div>


                    <div className="details-tracking">

                        {[
                            "pending",
                            "confirmed",
                            "processing",
                            "shipped",
                            "out_for_delivery",
                            "delivered",
                        ].map(
                            (
                                status,
                                index
                            ) => {

                                const statusIndex =
                                    [
                                        "pending",
                                        "confirmed",
                                        "processing",
                                        "shipped",
                                        "out_for_delivery",
                                        "delivered",
                                    ].indexOf(
                                        order.status
                                    );

                                const completed =
                                    index <=
                                    statusIndex;

                                return (
                                    <div
                                        className={`tracking-step ${
                                            completed
                                                ? "completed"
                                                : ""
                                        }`}
                                        key={
                                            status
                                        }
                                    >

                                        <div className="tracking-number">

                                            {completed
                                                ? "✓"
                                                : index +
                                                  1}

                                        </div>

                                        <span>
                                            {formatStatus(
                                                status
                                            )}
                                        </span>

                                    </div>
                                );
                            }
                        )}

                    </div>

                </section>
            )}


            {/* =====================================================
                ACTIONS
            ===================================================== */}

            <div className="order-details-actions">

                <button
                    className="continue-shopping-btn"
                    onClick={() =>
                        navigate("/")
                    }
                >
                    Continue Shopping
                </button>


                {canCancel && (

                    <button
                        className="cancel-order-btn"
                        onClick={
                            openCancelModal
                        }
                        disabled={cancelling}
                    >
                        Cancel Order
                    </button>

                )}

            </div>


            {/* =====================================================
                CANCEL MODAL
            ===================================================== */}

            {showCancelModal && (

                <div
                    className="cancel-modal-overlay"
                    onClick={
                        closeCancelModal
                    }
                >

                    <div
                        className="cancel-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* MODAL HEADER */}

                        <div className="cancel-modal-header">

                            <div>

                                <span>
                                    CANCEL ORDER
                                </span>

                                <h2>
                                    Why are you
                                    cancelling?
                                </h2>

                                <p>
                                    Please select a
                                    reason for
                                    cancelling this
                                    order.
                                </p>

                            </div>


                            <button
                                className="cancel-modal-close"
                                onClick={
                                    closeCancelModal
                                }
                                disabled={
                                    cancelling
                                }
                            >
                                ×
                            </button>

                        </div>


                        {/* REASONS */}

                        <div className="cancel-reasons">

                            {cancellationReasons.map(
                                (reason) => (

                                    <label
                                        className={`cancel-reason-option ${
                                            selectedReason ===
                                            reason
                                                ? "selected"
                                                : ""
                                        }`}
                                        key={
                                            reason
                                        }
                                    >

                                        <input
                                            type="radio"
                                            name="cancelReason"
                                            value={
                                                reason
                                            }
                                            checked={
                                                selectedReason ===
                                                reason
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setSelectedReason(
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                        />

                                        <span className="cancel-radio"></span>

                                        <span className="cancel-reason-text">
                                            {reason}
                                        </span>

                                    </label>

                                )
                            )}


                            {/* OTHER */}

                            <label
                                className={`cancel-reason-option ${
                                    selectedReason ===
                                    "Other reason"
                                        ? "selected"
                                        : ""
                                }`}
                            >

                                <input
                                    type="radio"
                                    name="cancelReason"
                                    value="Other reason"
                                    checked={
                                        selectedReason ===
                                        "Other reason"
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setSelectedReason(
                                            e.target.value
                                        )
                                    }
                                />

                                <span className="cancel-radio"></span>

                                <span className="cancel-reason-text">
                                    Other reason
                                </span>

                            </label>

                        </div>


                        {/* OTHER TEXT */}

                        {selectedReason ===
                            "Other reason" && (

                            <textarea
                                className="other-cancel-reason"
                                placeholder="Please tell us why you want to cancel..."
                                value={
                                    otherReason
                                }
                                onChange={(e) =>
                                    setOtherReason(
                                        e.target.value
                                    )
                                }
                                maxLength={250}
                            />
                        )}


                        {/* ACTIONS */}

                        <div className="cancel-modal-actions">

                            <button
                                className="cancel-modal-back"
                                onClick={
                                    closeCancelModal
                                }
                                disabled={
                                    cancelling
                                }
                            >
                                Keep Order
                            </button>


                            <button
                                className="cancel-modal-confirm"
                                onClick={
                                    confirmCancelOrder
                                }
                                disabled={
                                    cancelling
                                }
                            >
                                {cancelling
                                    ? "Cancelling..."
                                    : "Confirm Cancellation"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};

export default OrderDetails;