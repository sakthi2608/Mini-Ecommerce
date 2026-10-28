import { Link, useNavigate } from "react-router-dom";
import Search from "./Search";

export default function Header({ cartItems }) {
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("token");

    navigate("/login");
  };

  return (
    <nav className="navbar row">

      {/* BRAND */}
      <div className="col-12 col-md-3">
        <div className="navbar-brand">

          <Link to="/" className="b2b-brand">

            {/* B2B LOGO */}
            <svg
              className="b2b-logo"
              viewBox="0 0 80 80"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="B2B Logo"
            >
              <path
                d="M27 27V20C27 13 32 8 40 8C48 8 53 13 53 20V27"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />

              <path
                d="M18 27H62L67 68H13L18 27Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinejoin="round"
              />

              <path
                d="M29 37H42C48 37 51 40 51 44C51 47 49 49 46 50C50 51 53 54 53 58C53 63 49 65 42 65H29V37Z"
                fill="currentColor"
              />

              <circle
                cx="24"
                cy="72"
                r="3"
                fill="currentColor"
              />

              <circle
                cx="56"
                cy="72"
                r="3"
                fill="currentColor"
              />
            </svg>

            <div className="b2b-brand-text">
              <span className="b2b-name">B2B</span>

              <span className="b2b-tagline">
                BUSINESS • BETTER • TOGETHER
              </span>
            </div>

          </Link>

        </div>
      </div>


      {/* SEARCH */}
      <div className="col-12 col-md-6 mt-2 mt-md-0">
        <Search />
      </div>


      {/* CART / WISHLIST / PROFILE */}
      <div className="col-12 col-md-3 mt-4 mt-md-0 text-center">

        {/* CART */}
        <Link to="/cart">
          <span id="cart" className="ml-3">
            Cart
          </span>

          <span className="ml-1" id="cart_count">
            {cartItems.length}
          </span>
        </Link>


        {/* WISHLIST */}
        <Link
          to="/wishlist"
          className="wishlist-header-link"
        >
          ♡ Wishlist
        </Link>


        {/* PROFILE */}
        <button
          type="button"
          className="profile-header-btn"
          onClick={() => navigate("/dashboard")}
          title="My Dashboard"
          aria-label="My Dashboard"
        >
          <svg
            className="profile-header-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="8"
              r="4"
              stroke="currentColor"
              strokeWidth="1.8"
            />

            <path
              d="M4 21C4.8 16.8 7.4 14 12 14C16.6 14 19.2 16.8 20 21"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

      </div>

    </nav>
  );
}