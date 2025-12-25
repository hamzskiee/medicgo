import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScrollToTop from "@/components/utils/ScrollToTop";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

// Pages Imports
import Index from "./pages/Index";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import AddressPage from "./pages/AddressPage";
import OrdersPage from "./pages/OrdersPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import UploadPrescriptionPage from "./pages/UploadPrescriptionPage";
import NotFound from "./pages/NotFound";

// Admin Imports
import AdminLayout from "./components/admin/AdminLayout";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminPrescriptionsPage from "./pages/admin/AdminPrescriptionsPage";
import AdminRoute from "@/components/admin/AdminRoute"; 

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            {/* --- ScrollToTop --- */}
            <ScrollToTop />

            <Routes>
              {/* --- USER ROUTES (PUBLIK) --- */}
              <Route path="/" element={<Index />} />
              <Route path="/produk" element={<ProductsPage />} />
              <Route path="/produk/:id" element={<ProductDetailPage />} />
              <Route path="/keranjang" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/profil" element={<ProfilePage />} />
              <Route path="/pesanan" element={<OrdersPage />} />
              <Route path="/alamat" element={<AddressPage />} />
              <Route path="/lacak-pesanan" element={<OrderTrackingPage />} />
              <Route
                path="/upload-resep"
                element={<UploadPrescriptionPage />}
              />

              {/* --- ADMIN LOGIN (PUBLIK - PINTU MASUK) --- */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* --- ADMIN DASHBOARD (PROTECTED / DIKUNCI) --- */}
              {/* Kita bungkus area admin dengan AdminRoute */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="resep" element={<AdminPrescriptionsPage />} />
                  <Route
                    path="verifikasi-resep"
                    element={<AdminPrescriptionsPage />}
                  />
                </Route>
              </Route>

              {/* --- 404 PAGE --- */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
