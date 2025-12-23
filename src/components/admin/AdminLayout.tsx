import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  Package,
  Users,
  LogOut,
  Menu,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

// 1. IMPORT ADMIN HEADER YANG BARU DIBUAT
import { AdminHeader } from "@/components/admin/AdminHeader";
// (Pastikan path import ini sesuai dengan lokasi file AdminHeader.tsx Anda)

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // STATE NOTIFIKASI
  const [pendingRecipeCount, setPendingRecipeCount] = useState(0);

  const fetchPendingCount = async () => {
    // Hitung yg 'pending' (butuh harga) ATAU 'paid' (butuh dikirim)
    const { count, error } = await supabase
      .from("prescriptions")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending", "paid"]);

    if (!error && count !== null) {
      setPendingRecipeCount(count);
    }
  };

  useEffect(() => {
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Pesanan", href: "/admin/orders", icon: ShoppingBag },
    {
      label: "Verifikasi Resep",
      href: "/admin/verifikasi-resep",
      icon: FileText,
      badge: pendingRecipeCount,
    },
    { label: "Produk", href: "/admin/products", icon: Package },
    { label: "Pengguna", href: "/admin/users", icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-auto`}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <span className="text-xl font-bold text-primary">MedicGo Admin</span>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`relative flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1.5 shadow-sm animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-100">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => {
              logout();
              navigate("/auth");
            }}
          >
            <LogOut className="mr-2 h-5 w-5" /> Keluar
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* A. HEADER MOBILE (Hanya muncul di layar kecil) */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:hidden shrink-0">
          <span className="font-bold text-slate-900">Admin Panel</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </header>

      
        <div className="hidden lg:block shrink-0">
          <AdminHeader />
        </div>

        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
