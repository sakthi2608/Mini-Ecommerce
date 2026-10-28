import { useState } from 'react';
import './App.css';
import Home from './pages/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate
} from 'react-router-dom';
import ProductDetail from './pages/ProductDetail';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cart from './pages/Cart';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import Dashboard from "./pages/Dashboard";
import AdminOrders from "./pages/AdminOrders";
import OrderDetails from "./pages/OrderDetails";





function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ fromCart: true }} />;
  }

  return children;
}

function AppContent() {

  const [cartItems, setCartItems] = useState([]);
  const location = useLocation();

  const isRegisterPage = location.pathname === '/register';

  const isAuthPage =
    location.pathname === '/register' ||
    location.pathname === '/login' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/verify-otp' ||
    location.pathname === '/reset-password'||
      location.pathname === '/checkout';
    
  return (
    <div>

      <ToastContainer
        theme="dark"
        position="top-center"
      />

      {!isAuthPage && <Header cartItems={cartItems} />}

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/search" element={<Home />} />

        <Route
          path="/product/:id"
          element={
            <ProductDetail
              cartItems={cartItems}
              setCartItems={setCartItems}
            />
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart
                cartItems={cartItems}
                setCartItems={setCartItems}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <Cart
              cartItems={cartItems}
              setCartItems={setCartItems}
            />
          }
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/verify-otp"
          element={<VerifyOTP />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
  path="/checkout"
  element={
    <ProtectedRoute>
      <Checkout
        cartItems={cartItems}
        setCartItems={setCartItems}
      />
    </ProtectedRoute>
  }
/>
<Route path="/wishlist" element={<Wishlist />} />

<Route path="/dashboard" element={<Dashboard />} />

<Route
    path="/admin/orders"
    element={<AdminOrders />}
/>

<Route
    path="/order/:id"
    element={
        <ProtectedRoute>
            <OrderDetails />
        </ProtectedRoute>
    }
/>




      </Routes>

      {!isAuthPage && <Footer />}

    </div>
  );
}


function App() {

  return (
    <Router>
      <AppContent />
    </Router>
  );
}


export default App;