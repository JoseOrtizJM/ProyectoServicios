import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Cart from "./pages/Cart";
import Catalog from "./pages/Catalog";
import Checkout from "./pages/Checkout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Orders from "./pages/Orders";
import ProductDetail from "./pages/ProductDetail";
import Profile from "./pages/Profile";

// El panel de admin (y sobre todo recharts, que usa Analíticas) es pesado y
// solo lo carga un administrador — separarlo del bundle principal evita que
// invitados/usuarios normales lo descarguen sin necesitarlo nunca.
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));
const AdminBrands = lazy(() => import("./pages/admin/Brands"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminReviews = lazy(() => import("./pages/admin/Reviews"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));

function AdminFallback() {
  return <p className="py-16 text-center text-muted">Cargando panel de administración…</p>;
}

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
                <Route element={<ProtectedRoute adminOnly />}>
                  <Route
                    path="/admin"
                    element={
                      <Suspense fallback={<AdminFallback />}>
                        <AdminLayout />
                      </Suspense>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="productos" element={<AdminProducts />} />
                    <Route path="categorias" element={<AdminCategories />} />
                    <Route path="marcas" element={<AdminBrands />} />
                    <Route path="usuarios" element={<AdminUsers />} />
                    <Route path="pedidos" element={<AdminOrders />} />
                    <Route path="resenas" element={<AdminReviews />} />
                    <Route path="analiticas" element={<AdminAnalytics />} />
                  </Route>
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
