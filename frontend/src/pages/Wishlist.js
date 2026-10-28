import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Wishlist.css";

export default function Wishlist() {

    const navigate = useNavigate();

    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");


    // Get Wishlist
    const getWishlist = async () => {

        if (!token) {
            setLoading(false);
            return;
        }

        try {

            const { data } = await axios.get(
                `${process.env.REACT_APP_API_URL}/wishlist`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (data.success) {
                setWishlist(data.wishlist);
            }

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Unable to load wishlist"
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        getWishlist();
    }, []);


    // Remove from Wishlist
    const removeWishlist = async (productId) => {

        try {

            await axios.delete(
                `${process.env.REACT_APP_API_URL}/wishlist/${productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setWishlist((prev) =>
                prev.filter(
                    item => item.product?._id !== productId
                )
            );

            toast.success("Removed from wishlist");

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Unable to remove product"
            );

        }
    };


    // Place Order
    const placeOrder = (product) => {

        const existingCart =
            JSON.parse(localStorage.getItem("cartItems")) || [];

        const existingItem = existingCart.find(
            item => item.product?._id === product._id
        );

        let updatedCart;

        if (existingItem) {

            updatedCart = existingCart;

        } else {

            updatedCart = [
                ...existingCart,
                {
                    product: product,
                    qty: 1
                }
            ];

        }

        localStorage.setItem(
            "cartItems",
            JSON.stringify(updatedCart)
        );

        navigate("/checkout");
    };


    // Login required
    if (!token) {

        return (
            <div className="wishlist-page">

                <div className="wishlist-empty">

                    <div className="wishlist-icon">
                        ♡
                    </div>

                    <h2>Your Wishlist</h2>

                    <p>
                        Login to save products you love.
                    </p>

                    <Link
                        to="/login"
                        className="wishlist-login-btn"
                    >
                        Login
                    </Link>

                </div>

            </div>
        );
    }


    // Loading
    if (loading) {

        return (
            <div className="wishlist-page">

                <div className="wishlist-loading">
                    Loading your wishlist...
                </div>

            </div>
        );
    }


    return (

        <div className="wishlist-page">

            <div className="wishlist-container">

                {/* Header */}

                <div className="wishlist-header">

                    <div>

                        <p className="wishlist-eyebrow">
                            YOUR COLLECTION
                        </p>

                        <h1>
                            My Wishlist
                        </h1>

                        <p>
                            Products you've saved for later.
                        </p>

                    </div>

                    <span className="wishlist-count">

                        {wishlist.length}{" "}

                        {wishlist.length === 1
                            ? "Item"
                            : "Items"}

                    </span>

                </div>


                {/* Empty Wishlist */}

                {wishlist.length === 0 ? (

                    <div className="wishlist-empty">

                        <div className="wishlist-icon">
                            ♡
                        </div>

                        <h2>
                            Your wishlist is empty
                        </h2>

                        <p>
                            Save products you love and
                            find them here anytime.
                        </p>

                        <Link
                            to="/"
                            className="wishlist-shop-btn"
                        >
                            Explore Products
                        </Link>

                    </div>

                ) : (

                    /* Wishlist Products */

                    <div className="wishlist-grid">

                        {wishlist.map((item) => {

                            const product = item.product;

                            if (!product) return null;

                            return (

                                <div
                                    className="wishlist-card"
                                    key={item._id}
                                >

                                    {/* Image */}

                                    <div className="wishlist-image-wrap">

                                        <img
                                            src={
                                                product.images?.[0]?.image
                                            }
                                            alt={product.name}
                                        />

                                    </div>


                                    {/* Card Body */}

                                    <div className="wishlist-card-body">

                                        <h3>

                                            <Link
                                                to={`/product/${product._id}`}
                                            >
                                                {product.name}
                                            </Link>

                                        </h3>


                                        <p className="wishlist-description">

                                            {product.description}

                                        </p>


                                        {/* Price + Actions */}

                                        <div className="wishlist-bottom">

                                            <span className="wishlist-price">

                                                ₹{product.price}

                                            </span>


                                            <div className="wishlist-actions">

                                                <Link
                                                    to={`/product/${product._id}`}
                                                    className="wishlist-view-btn"
                                                >
                                                    View
                                                </Link>


                                                <button
                                                    type="button"
                                                    className="wishlist-order-btn"
                                                    onClick={() =>
                                                        placeOrder(product)
                                                    }
                                                >
                                                    Place Order
                                                </button>

                                            </div>

                                        </div>


                                        {/* Remove */}

                                        <button
                                            type="button"
                                            className="wishlist-remove-btn"
                                            onClick={() =>
                                                removeWishlist(
                                                    product._id
                                                )
                                            }
                                        >
                                            Remove from Wishlist
                                        </button>

                                    </div>

                                </div>

                            );

                        })}

                    </div>

                )}

            </div>

        </div>

    );
}