import { BrowserRouter, Route, Routes } from "react-router-dom";

import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import Cart from "./pages/Cart";
import Catalog from "./pages/Catalog";
import Checkout from "./pages/Checkout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Orders from "./pages/Orders";
import ProductDetail from "./pages/ProductDetail";
import Profile from "./pages/Profile";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/catalogo" element={<Catalog />} />
                <Route path="/productos/:productId" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/carrito" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/pedidos" element={<Orders />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
