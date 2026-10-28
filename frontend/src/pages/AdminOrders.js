import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./AdminOrders.css";

const API_URL =
    process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1";

const AdminOrders = () => {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const statuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered"
    ];

    // =====================================
    // GET ALL ORDERS
    // =====================================

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {

        try {

            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/admin/orders`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {

                setOrders(data.orders || []);

            } else {

                toast.error(
                    data.message || "Unable to load orders"
                );
            }

        } catch (error) {

            console.error(
                "Admin Orders Error:",
                error
            );

            toast.error(
                "Something went wrong"
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================
    // UPDATE ORDER STATUS
    // =====================================

    const updateStatus = async (
        orderId,
        status
    ) => {

        try {

            setUpdatingId(orderId);

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/admin/order/${orderId}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        status
                    })
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {

                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === orderId
                            ? {
                                ...order,
                                status:
                                    data.order.status
                            }
                            : order
                    )
                );

                toast.success(
                    "Order status updated"
                );

            } else {

                toast.error(
                    data.message ||
                    "Unable to update status"
                );
            }

        } catch (error) {

            console.error(
                "Status Update Error:",
                error
            );

            toast.error(
                "Something went wrong"
            );

        } finally {

            setUpdatingId(null);
        }
    };


    // =====================================
    // FORMAT STATUS
    // =====================================

    const formatStatus = (status) => {

        return status
            .replaceAll("_", " ")
            .replace(
                /\b\w/g,
                letter => letter.toUpperCase()
            );
    };


    // =====================================
    // FORMAT DATE
    // =====================================

    const formatDate = (date) => {

        return new Date(date)
            .toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );
    };


    // =====================================
    // LOADING
    // =====================================

    if (loading) {

        return (
            <div className="admin-orders-loading">

                <div className="admin-orders-spinner"></div>

                <p>
                    Loading orders...
                </p>

            </div>
        );
    }


    // =====================================
    // PAGE
    // =====================================

    return (

        <div className="admin-orders-page">

            {/* HEADER */}

            <div className="admin-orders-header">

                <div>

                    <h1>
                        Orders
                    </h1>

                    <p>
                        Manage customer orders
                        and shipping status
                    </p>

                </div>

                <div className="admin-orders-count">

                    {orders.length} Orders

                </div>

            </div>


            {/* EMPTY */}

            {orders.length === 0 ? (

                <div className="admin-orders-empty">

                    <h3>
                        No Orders Found
                    </h3>

                    <p>
                        Customer orders will
                        appear here.
                    </p>

                </div>

            ) : (

                <div className="admin-orders-list">

                    {orders.map(order => {

                        const firstItem =
                            order.cartItems?.[0];

                        const isCancelled =
                            order.status === "cancelled";

                        return (

                            <div
                                className="admin-order-card"
                                key={order._id}
                            >

                                {/* TOP */}

                                <div className="admin-order-top">

                                    <div>

                                        <span>
                                            ORDER ID
                                        </span>

                                        <h3>
                                            #
                                            {order._id
                                                .slice(-8)
                                                .toUpperCase()}
                                        </h3>

                                    </div>


                                    <div>

                                        <span>
                                            ORDERED ON
                                        </span>

                                        <p>
                                            {formatDate(
                                                order.createdAt
                                            )}
                                        </p>

                                    </div>


                                    <div>

                                        <span>
                                            TOTAL
                                        </span>

                                        <strong>
                                            ₹{order.amount}
                                        </strong>

                                    </div>

                                </div>


                                {/* MIDDLE */}

                                <div className="admin-order-middle">


                                    {/* PRODUCT */}

                                    <div className="admin-order-product">

                                        <div className="admin-order-image">

                                            <img
                                                src={
                                                    firstItem
                                                        ?.product
                                                        ?.images?.[0]
                                                        ?.image ||
                                                    "/images/default-product.png"
                                                }
                                                alt={
                                                    firstItem
                                                        ?.product
                                                        ?.name ||
                                                    "Product"
                                                }
                                                onError={(e) => {
                                                    e.target.src =
                                                        "/images/default-product.png";
                                                }}
                                            />

                                        </div>


                                        <div>

                                            <h3>
                                                {
                                                    firstItem
                                                        ?.product
                                                        ?.name ||
                                                    "Product"
                                                }
                                            </h3>

                                            <p>
                                                {
                                                    order
                                                        .cartItems
                                                        ?.length || 0
                                                }{" "}
                                                {
                                                    order
                                                        .cartItems
                                                        ?.length === 1
                                                        ? "Item"
                                                        : "Items"
                                                }
                                            </p>

                                            <small>
                                                Customer:{" "}
                                                {
                                                    order
                                                        .shippingInfo
                                                        ?.name
                                                }
                                            </small>

                                        </div>

                                    </div>


                                    {/* DELIVERY */}

                                    <div className="admin-delivery">

                                        <span>
                                            DELIVERY
                                        </span>

                                        <p>
                                            {
                                                order
                                                    .shippingInfo
                                                    ?.city
                                            }
                                            ,{" "}
                                            {
                                                order
                                                    .shippingInfo
                                                    ?.state
                                            }
                                        </p>

                                        <small>
                                            {
                                                order
                                                    .shippingInfo
                                                    ?.pincode
                                            }
                                        </small>

                                    </div>


                                    {/* STATUS */}

                                    <div className="admin-status">

                                        <span>
                                            SHIPPING STATUS
                                        </span>

                                        {isCancelled ? (

                                            <div className="admin-cancelled-status">
                                                Cancelled
                                            </div>

                                        ) : (

                                            <select
                                                value={
                                                    order.status
                                                }
                                                disabled={
                                                    updatingId ===
                                                    order._id
                                                }
                                                onChange={(e) =>
                                                    updateStatus(
                                                        order._id,
                                                        e.target.value
                                                    )
                                                }
                                            >

                                                {statuses.map(
                                                    status => (

                                                        <option
                                                            value={
                                                                status
                                                            }
                                                            key={
                                                                status
                                                            }
                                                        >
                                                            {
                                                                formatStatus(
                                                                    status
                                                                )
                                                            }
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        )}

                                    </div>

                                </div>


                                {/* CANCEL REASON */}

                                {isCancelled &&
                                    order.cancelReason && (

                                        <div className="admin-cancel-reason">

                                            <strong>
                                                Cancellation Reason:
                                            </strong>

                                            <span>
                                                {
                                                    order.cancelReason
                                                }
                                            </span>

                                        </div>

                                    )}

                            </div>
                        );
                    })}

                </div>

            )}

        </div>
    );
};

export default AdminOrders;