import { Fragment, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify';

export default function Cart({ cartItems, setCartItems }) {
    const [complete, setComplete] = useState(false);
     const navigate = useNavigate();
    function increaseQty(productId) {
        setCartItems((state) =>
            state.map((item) =>
                item.product._id === productId
                    ? {
                          ...item,
                          qty:
                              item.qty < item.product.stock
                                  ? item.qty + 1
                                  : item.qty,
                      }
                    : item
            )
        );
    }

    function decreaseQty(productId) {
        setCartItems((state) =>
            state.map((item) =>
                item.product._id === productId
                    ? {
                          ...item,
                          qty: item.qty > 1 ? item.qty - 1 : item.qty,
                      }
                    : item
            )
        );
    }

    function removeItem(item) {
        const updateItems = cartItems.filter(
            (i) => i.product._id !== item.product._id
        );

        setCartItems(updateItems);
    }

    function placeOrderHandler() {
        fetch(process.env.REACT_APP_API_URL + "/order/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(cartItems),
        })
            .then((res) => res.json())
            .then(() => {
                setCartItems([]);
                setComplete(true);
                toast.success("Order Success!")

            })
            .catch((err) => console.log(err));
    }

    return cartItems.length > 0 ? (
        <Fragment>
            <div className="container container-fluid">
                <h2 className="mt-5">
                    Your Cart:{" "}
                    <b>
                        {cartItems.reduce((acc, item) => acc + item.qty, 0)} items
                    </b>
                </h2>

                <div className="row d-flex justify-content-between">
                    <div className="col-12 col-lg-8">

                        {cartItems.map((item) => (
                            <Fragment key={item.product._id}>

                                <div className="cart-item">
                                    <div className="row">

                                        <div className="col-4 col-lg-3">
                                            <img
                                                src={item.product.images[0].image}
                                                alt={item.product.name}
                                                height="90"
                                                width="115"
                                            />
                                        </div>

                                        <div className="col-5 col-lg-3">
                                            <Link to={`/product/${item.product._id}`}>
                                                {item.product.name}
                                            </Link>
                                        </div>

                                        <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                                            <p id="card_item_price">
                                                ${item.product.price}
                                            </p>
                                        </div>

                                        <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                                            <div className="stockCounter d-inline">

                                                <span
                                                    className="btn btn-danger minus"
                                                    onClick={() =>
                                                        decreaseQty(item.product._id)
                                                    }
                                                >
                                                    -
                                                </span>

                                                <input
                                                    type="number"
                                                    className="form-control count d-inline"
                                                    value={item.qty}
                                                    readOnly
                                                />

                                                <span
                                                    className="btn btn-primary plus"
                                                    onClick={() =>
                                                        increaseQty(item.product._id)
                                                    }
                                                >
                                                    +
                                                </span>

                                            </div>
                                        </div>

                                        <div className="col-4 col-lg-1 mt-4 mt-lg-0">
                                            <i
                                                id="delete_cart_item"
                                                className="fa fa-trash btn btn-danger"
                                                onClick={() => removeItem(item)}
                                            ></i>
                                        </div>

                                    </div>
                                </div>

                                <hr />

                            </Fragment>
                        ))}

                    </div>

                    <div className="col-12 col-lg-3 my-4">
                        <div id="order_summary">

                            <h4>Order Summary</h4>

                            <hr />

                            <p>
                                Subtotal:
                                <span className="order-summary-values">
                                    {cartItems.reduce(
                                        (acc, item) => acc + item.qty,
                                        0
                                    )}{" "}
                                    (Units)
                                </span>
                            </p>

                            <p>
                                Est. total:
                                <span className="order-summary-values">
                                    $
                                    {cartItems
                                        .reduce(
                                            (acc, item) =>
                                                acc +
                                                Number(item.product.price) * item.qty,
                                            0
                                        )
                                        .toFixed(2)}
                                </span>
                            </p>

                            <hr />

                            <button
    id="checkout_btn"
    onClick={() => navigate("/checkout")}
    className="btn btn-primary btn-block"
>
    Place Order
</button>

                        </div>
                    </div>

                </div>
            </div>
        </Fragment>
    ) : (
        !complete ? (
            <h2 className="mt-5 text-center">Your Cart is Empty!</h2>
        ) : (
            <Fragment>
                <h2 className="mt-5 text-center">Order Completed!</h2>
                <p className="text-center">
                    Your order has been Placed Successfully.
                </p>
            </Fragment>
        )
    );
}