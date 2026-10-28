import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function ProductCard({ product }) {

    const [isWishlisted, setIsWishlisted] = useState(false);
    const [loading, setLoading] = useState(false);

    // Check whether product is already in wishlist
    useEffect(() => {

        const token = localStorage.getItem("token");

        if (!token) {
            setIsWishlisted(false);
            return;
        }

        const checkWishlist = async () => {

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

                    const alreadyExists = data.wishlist.some(
                        item => item.product?._id === product._id
                    );

                    setIsWishlisted(alreadyExists);
                }

            } catch (error) {

                console.error("Wishlist Check Error:", error);

            }
        };

        checkWishlist();

    }, [product._id]);


    // Add product
    const addToWishlist = async () => {

        const token = localStorage.getItem("token");

        if (!token) {
            toast.info("Please login to add products to wishlist");
            return;
        }

        try {

            setLoading(true);

            const { data } = await axios.post(
                `${process.env.REACT_APP_API_URL}/wishlist`,
                {
                    productId: product._id
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (data.success) {

                setIsWishlisted(true);

                toast.success("Added to wishlist ❤️");
            }

        } catch (error) {

            if (
                error.response?.data?.message ===
                "Product already exists in wishlist"
            ) {

                setIsWishlisted(true);

                toast.info("Already in your wishlist ❤️");

            } else {

                toast.error(
                    error.response?.data?.message ||
                    "Unable to update wishlist"
                );
            }

        } finally {

            setLoading(false);

        }
    };


    // Remove product
    const removeFromWishlist = async () => {

        const token = localStorage.getItem("token");

        if (!token) {
            toast.info("Please login to continue");
            return;
        }

        try {

            setLoading(true);

            const { data } = await axios.delete(
                `${process.env.REACT_APP_API_URL}/wishlist/${product._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (data.success) {

                setIsWishlisted(false);

                toast.success("Removed from wishlist");

            }

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Unable to remove from wishlist"
            );

        } finally {

            setLoading(false);

        }
    };


    const wishlistHandler = () => {

        if (isWishlisted) {

            removeFromWishlist();

        } else {

            addToWishlist();

        }

    };


    return (
        <div className="col-sm-12 col-md-6 col-lg-3 my-3">

            <div className="card p-3 rounded h-100 position-relative">

                {/* Wishlist Button */}
                <button
                    type="button"
                    className={`wishlist-btn ${
                        isWishlisted ? "wishlist-active" : ""
                    }`}
                    onClick={wishlistHandler}
                    disabled={loading}
                    aria-label="Wishlist"
                >

                    {isWishlisted ? "♥" : "♡"}

                </button>


                {/* Product Image */}
                <img
                    className="card-img-top mx-auto"
                    src={product.images[0].image}
                    alt={product.name}
                />


                <div className="card-body d-flex flex-column">

                    <h5 className="card-title">

                        <Link to={`/product/${product._id}`}>
                            {product.name}
                        </Link>

                    </h5>


                    <div className="ratings mt-auto">

                        <div className="rating-outer">

                            <div
                                className="rating-inner"
                                style={{
                                    width: `${product.ratings / 5 * 100}%`
                                }}
                            ></div>

                        </div>

                    </div>


                    <p className="card-text description">
                        {product.description}
                    </p>


                    <p className="card-text">
                        ₹{product.price}
                    </p>


                    <Link
                        to={`/product/${product._id}`}
                        id="view_btn"
                        className="btn btn-block"
                    >
                        View Details
                    </Link>

                </div>

            </div>

        </div>
    );
}