import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Dashboard.css";

const API_URL =
    process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1";

const Dashboard = () => {
    const navigate = useNavigate();

    const [currentOrder, setCurrentOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [cancelledOrders, setCancelledOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName");

    const shipmentSteps = [
        { key: "pending", label: "Ordered" },
        { key: "confirmed", label: "Confirmed" },
        { key: "processing", label: "Processing" },
        { key: "shipped", label: "Shipped" },
        { key: "out_for_delivery", label: "Out for Delivery" },
        { key: "delivered", label: "Delivered" },
    ];

    // =====================================================
    // FETCH DASHBOARD DATA
    // =====================================================
    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const headers = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            };

            const [currentResponse, ordersResponse] =
                await Promise.all([
                    fetch(`${API_URL}/my-current-order`, {
                        method: "GET",
                        headers,
                    }),

                    fetch(`${API_URL}/my-orders`, {
                        method: "GET",
                        headers,
                    }),
                ]);

            const currentData =
                await currentResponse.json();

            const ordersData =
                await ordersResponse.json();

            // Current shipment
            if (
                currentResponse.ok &&
                currentData.success
            ) {
                setCurrentOrder(
                    currentData.order || null
                );
            }

            // Orders
            if (
                ordersResponse.ok &&
                ordersData.success
            ) {
                const allOrders =
                    ordersData.orders || [];

                // Delivered orders only
                const deliveredOrders =
                    allOrders.filter(
                        (order) =>
                            order.status === "delivered"
                    );

                // Cancelled orders only
                const cancelled =
                    allOrders.filter(
                        (order) =>
                            order.status === "cancelled"
                    );

                setOrders(deliveredOrders);
                setCancelledOrders(cancelled);
            }

            if (
                !currentResponse.ok ||
                !ordersResponse.ok
            ) {
                toast.error(
                    "Unable to load your orders"
                );
            }

        } catch (error) {
            console.error(
                "Dashboard Error:",
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
    // USE EFFECT
    // =====================================================
    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        fetchDashboardData();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, navigate]);

    // =====================================================
    // STATUS INDEX
    // =====================================================
    const getStatusIndex = (status) => {
        const index =
            shipmentSteps.findIndex(
                (step) => step.key === status
            );

        return index === -1 ? 0 : index;
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
                month: "short",
                year: "numeric",
            }
        );
    };

    // =====================================================
    // EXPECTED DELIVERY
    // =====================================================
    const getExpectedDelivery = (createdAt) => {
        if (!createdAt) return "-";

        const date = new Date(createdAt);

        date.setDate(
            date.getDate() + 5
        );

        return formatDate(date);
    };

    // =====================================================
    // PRODUCT IMAGE
    // =====================================================
    const getProductImage = (order) => {
        const item =
            order?.cartItems?.[0];

        return (
            item?.product?.images?.[0]?.image ||
            item?.product?.image ||
            "/images/default-product.png"
        );
    };

    // =====================================================
    // PRODUCT NAME
    // =====================================================
    const getProductName = (order) => {
        const item =
            order?.cartItems?.[0];

        return (
            item?.product?.name ||
            "Product"
        );
    };

    // =====================================================
    // LOADING
    // =====================================================
    if (loading) {
        return (
            <div className="dashboard-loading">

                <div className="dashboard-spinner"></div>

                <p>
                    Loading your orders...
                </p>

            </div>
        );
    }

    return (
        <div className="dashboard-page">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="dashboard-header">

                <div>

                    <h1>
                        My Orders
                    </h1>

                    <p>
                        Welcome back,{" "}
                        <strong>
                            {userName ||
                                "Customer"}
                        </strong>
                    </p>

                </div>

            </div>


            {/* =====================================================
                CURRENT SHIPMENT
            ===================================================== */}

            <section className="shipment-section-main">

                <div className="dashboard-section-heading">

                    <h2>
                        Current Shipment
                    </h2>

                </div>


                {!currentOrder ? (

                    <div className="no-current-order">

                        <div className="no-order-icon">
                            📦
                        </div>

                        <h3>
                            No active shipment
                        </h3>

                        <p>
                            You don't have any active
                            orders right now.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/")
                            }
                            className="dashboard-shop-btn"
                        >
                            Continue Shopping
                        </button>

                    </div>

                ) : (

                    <div className="shipment-card">

                        {/* ORDER TOP */}

                        <div className="shipment-card-top">

                            <div className="shipment-product">

                                <div className="shipment-image-box">

                                    <img
                                        src={getProductImage(
                                            currentOrder
                                        )}
                                        alt={getProductName(
                                            currentOrder
                                        )}
                                        onError={(e) => {
                                            e.target.src =
                                                "/images/default-product.png";
                                        }}
                                    />

                                </div>


                                <div className="shipment-product-info">

                                    <span className="order-label">
                                        ORDER ID
                                    </span>

                                    <h3>
                                        #
                                        {currentOrder._id
                                            .slice(-8)
                                            .toUpperCase()}
                                    </h3>

                                    <p className="shipment-product-name">
                                        {getProductName(
                                            currentOrder
                                        )}
                                    </p>

                                    {currentOrder.cartItems
                                        .length > 1 && (
                                        <span className="more-items">

                                            +
                                            {currentOrder
                                                .cartItems
                                                .length - 1}{" "}
                                            more item
                                            {currentOrder
                                                .cartItems
                                                .length -
                                                1 >
                                            1
                                                ? "s"
                                                : ""}

                                        </span>
                                    )}

                                </div>

                            </div>


                            <div className="shipment-price">

                                <span className="order-label">
                                    TOTAL
                                </span>

                                <strong>
                                    ₹
                                    {
                                        currentOrder.amount
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* CURRENT ORDER DETAILS */}

                        <div className="current-order-action">

                            <button
                                className="view-order-btn"
                                onClick={() =>
                                    navigate(
                                        `/order/${currentOrder._id}`
                                    )
                                }
                            >
                                View Order Details →
                            </button>

                        </div>


                        {/* DELIVERY INFO */}

                        <div className="shipment-delivery-info">

                            <div className="shipment-current-status">

                                <span className="order-label">
                                    CURRENT STATUS
                                </span>

                                <h3>
                                    {formatStatus(
                                        currentOrder.status
                                    )}
                                </h3>

                            </div>


                            <div className="shipment-expected">

                                <span className="order-label">
                                    EXPECTED DELIVERY
                                </span>

                                <strong>
                                    {getExpectedDelivery(
                                        currentOrder.createdAt
                                    )}
                                </strong>

                            </div>

                        </div>


                        {/* TRACKING */}

                        <div className="shipment-tracking">

                            <div className="tracking-line"></div>

                            {shipmentSteps.map(
                                (
                                    step,
                                    index
                                ) => {

                                    const currentIndex =
                                        getStatusIndex(
                                            currentOrder.status
                                        );

                                    const completed =
                                        index <=
                                        currentIndex;

                                    return (
                                        <div
                                            className={`tracking-step ${
                                                completed
                                                    ? "completed"
                                                    : ""
                                            }`}
                                            key={
                                                step.key
                                            }
                                        >

                                            <div className="tracking-circle">

                                                {completed
                                                    ? "✓"
                                                    : index +
                                                      1}

                                            </div>

                                            <span>
                                                {
                                                    step.label
                                                }
                                            </span>

                                        </div>
                                    );
                                }
                            )}

                        </div>


                        {/* ADDRESS */}

                        <div className="shipment-address">

                            <div>

                                <span className="order-label">
                                    DELIVERY ADDRESS
                                </span>

                                <p>

                                    <strong>
                                        {
                                            currentOrder
                                                .shippingInfo
                                                ?.name
                                        }
                                    </strong>

                                    <br />

                                    {
                                        currentOrder
                                            .shippingInfo
                                            ?.address
                                    }

                                    <br />

                                    {
                                        currentOrder
                                            .shippingInfo
                                            ?.city
                                    }
                                    ,{" "}
                                    {
                                        currentOrder
                                            .shippingInfo
                                            ?.state
                                    }{" "}
                                    -{" "}
                                    {
                                        currentOrder
                                            .shippingInfo
                                            ?.pincode
                                    }

                                </p>

                            </div>


                            <div className="shipment-order-date">

                                <span className="order-label">
                                    ORDERED ON
                                </span>

                                <p>
                                    {formatDate(
                                        currentOrder.createdAt
                                    )}
                                </p>

                            </div>

                        </div>

                    </div>
                )}

            </section>


            {/* =====================================================
                ORDER HISTORY
            ===================================================== */}

            <section className="order-history-section">

                <div className="dashboard-section-heading">

                    <h2>
                        Order History
                    </h2>

                    <span className="history-count">

                        {orders.length}{" "}

                        {orders.length === 1
                            ? "Order"
                            : "Orders"}

                    </span>

                </div>


                {orders.length === 0 ? (

                    <div className="no-history">

                        <p>
                            You haven't completed
                            any orders yet.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/")
                            }
                            className="dashboard-shop-btn"
                        >
                            Start Shopping
                        </button>

                    </div>

                ) : (

                    <div className="history-list">

                        {orders.map(
                            (order) => {

                                const isDelivered =
                                    order.status ===
                                    "delivered";

                                return (
                                    <div
                                        className="history-card"
                                        key={
                                            order._id
                                        }
                                    >

                                        {/* HISTORY HEADER */}

                                        <div className="history-card-header">

                                            <div>

                                                <span className="order-label">
                                                    ORDER ID
                                                </span>

                                                <strong>
                                                    #
                                                    {order._id
                                                        .slice(
                                                            -8
                                                        )
                                                        .toUpperCase()}
                                                </strong>

                                            </div>


                                            <div className="history-date">

                                                <span className="order-label">
                                                    ORDERED ON
                                                </span>

                                                <span>
                                                    {formatDate(
                                                        order.createdAt
                                                    )}
                                                </span>

                                            </div>


                                            <span
                                                className={`history-status status-${order.status}`}
                                            >
                                                {formatStatus(
                                                    order.status
                                                )}
                                            </span>

                                        </div>


                                        {/* HISTORY BODY */}

                                        <div className="history-card-body">

                                            <div className="history-product">

                                                <div className="history-image-box">

                                                    <img
                                                        src={getProductImage(
                                                            order
                                                        )}
                                                        alt={getProductName(
                                                            order
                                                        )}
                                                        onError={(
                                                            e
                                                        ) => {
                                                            e.target.src =
                                                                "/images/default-product.png";
                                                        }}
                                                    />

                                                </div>


                                                <div className="history-product-info">

                                                    <h3>
                                                        {getProductName(
                                                            order
                                                        )}
                                                    </h3>

                                                    <p>
                                                        {
                                                            order
                                                                .cartItems
                                                                .length
                                                        }{" "}
                                                        {order
                                                            .cartItems
                                                            .length ===
                                                        1
                                                            ? "Item"
                                                            : "Items"}
                                                    </p>

                                                </div>

                                            </div>


                                            <div className="history-price">

                                                <span className="order-label">
                                                    TOTAL
                                                </span>

                                                <strong>
                                                    ₹
                                                    {
                                                        order.amount
                                                    }
                                                </strong>

                                            </div>


                                            {/* VIEW ORDER */}

                                            <div className="history-order-action">

                                                <button
                                                    className="view-order-btn"
                                                    onClick={() =>
                                                        navigate(
                                                            `/order/${order._id}`
                                                        )
                                                    }
                                                >
                                                    View Order Details →
                                                </button>

                                            </div>


                                            {/* REVIEW */}

                                            {isDelivered && (
                                                <div className="review-area">

                                                    <div className="review-stars">

                                                        <button>
                                                            ☆
                                                        </button>

                                                        <button>
                                                            ☆
                                                        </button>

                                                        <button>
                                                            ☆
                                                        </button>

                                                        <button>
                                                            ☆
                                                        </button>

                                                        <button>
                                                            ☆
                                                        </button>

                                                    </div>


                                                    <button
                                                        className="review-btn"
                                                        onClick={() =>
                                                            toast.info(
                                                                "Review feature coming next"
                                                            )
                                                        }
                                                    >
                                                        Write a Review
                                                    </button>

                                                </div>
                                            )}

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}

            </section>


            {/* =====================================================
                CANCELLED ORDERS
            ===================================================== */}

            {cancelledOrders.length > 0 && (

                <section className="cancelled-orders-section">

                    <div className="dashboard-section-heading">

                        <h2>
                            Cancelled Orders
                        </h2>

                        <span className="history-count">

                            {cancelledOrders.length}{" "}

                            {cancelledOrders.length === 1
                                ? "Order"
                                : "Orders"}

                        </span>

                    </div>


                    <div className="history-list">

                        {cancelledOrders.map(
                            (order) => (

                                <div
                                    className="history-card cancelled-order-card"
                                    key={
                                        order._id
                                    }
                                >

                                    {/* CANCELLED HEADER */}

                                    <div className="history-card-header">

                                        <div>

                                            <span className="order-label">
                                                ORDER ID
                                            </span>

                                            <strong>
                                                #
                                                {order._id
                                                    .slice(
                                                        -8
                                                    )
                                                    .toUpperCase()}
                                            </strong>

                                        </div>


                                        <div className="history-date">

                                            <span className="order-label">
                                                ORDERED ON
                                            </span>

                                            <span>
                                                {formatDate(
                                                    order.createdAt
                                                )}
                                            </span>

                                        </div>


                                        <span className="history-status status-cancelled">
                                            Cancelled
                                        </span>

                                    </div>


                                    {/* CANCELLED BODY */}

                                    <div className="history-card-body">

                                        <div className="history-product">

                                            <div className="history-image-box">

                                                <img
                                                    src={getProductImage(
                                                        order
                                                    )}
                                                    alt={getProductName(
                                                        order
                                                    )}
                                                    onError={(
                                                        e
                                                    ) => {
                                                        e.target.src =
                                                            "/images/default-product.png";
                                                    }}
                                                />

                                            </div>


                                            <div className="history-product-info">

                                                <h3>
                                                    {getProductName(
                                                        order
                                                    )}
                                                </h3>

                                                <p>
                                                    {
                                                        order
                                                            .cartItems
                                                            .length
                                                    }{" "}
                                                    {order
                                                        .cartItems
                                                        .length ===
                                                    1
                                                        ? "Item"
                                                        : "Items"}
                                                </p>

                                                <small className="cancelled-message">
                                                    This order was
                                                    cancelled.
                                                </small>

                                            </div>

                                        </div>


                                        <div className="history-price">

                                            <span className="order-label">
                                                TOTAL
                                            </span>

                                            <strong>
                                                ₹
                                                {
                                                    order.amount
                                                }
                                            </strong>

                                        </div>


                                        <div className="history-order-action">

                                            <button
                                                className="view-order-btn"
                                                onClick={() =>
                                                    navigate(
                                                        `/order/${order._id}`
                                                    )
                                                }
                                            >
                                                View Order Details →
                                            </button>

                                        </div>

                                    </div>

                                </div>
                            )
                        )}

                    </div>

                </section>
            )}

        </div>
    );
};

export default Dashboard;