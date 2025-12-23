import React, { useState, useEffect } from "react";
import {
  LogOut,
  Bell,
  User,
  FileText,
  ShoppingBag,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase"; // Import Supabase

export function AdminHeader() {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());

  // STATE DATA NOTIFIKASI
  const [notifCounts, setNotifCounts] = useState({
    prescriptions: 0,
    orders: 0,
    lowStock: 0,
  });

  // FUNGSI CEK DATA KE DATABASE
  const fetchNotifications = async () => {
    try {
      // 1. Cek Resep Pending (Butuh Harga)
      const { count: recipeCount } = await supabase
        .from("prescriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // 2. Cek Order Baru / Butuh Dikirim (Pending / Paid)
      const { count: orderCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "paid"]);

      // 3. Cek Stok Menipis (< 10)
      // Note: Karena Supabase filter lt (less than) butuh nama kolom
      const { data: products } = await supabase
        .from("products")
        .select("stock");

      const lowStockCount = products?.filter((p) => p.stock < 10).length || 0;

      setNotifCounts({
        prescriptions: recipeCount || 0,
        orders: orderCount || 0,
        lowStock: lowStockCount || 0,
      });
    } catch (error) {
      console.error("Gagal ambil notifikasi", error);
    }
  };

  useEffect(() => {
    // Jalankan saat pertama kali
    fetchNotifications();
    // Update jam
    const timer = setInterval(() => setDate(new Date()), 60000);
    // Update notifikasi setiap 10 detik (Realtime polling sederhana)
    const notifTimer = setInterval(fetchNotifications, 10000);

    return () => {
      clearInterval(timer);
      clearInterval(notifTimer);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    toast({
      title: "Logout Berhasil",
      description: "Sampai jumpa kembali, Admin!",
    });
    navigate("/admin/login");
  };

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  // Hitung total notifikasi untuk badge merah
  const totalNotif =
    notifCounts.prescriptions + notifCounts.orders + notifCounts.lowStock;

  return (
    <header className="relative z-50 h-16 w-full border-b border-slate-200 bg-white/95 backdrop-blur px-6 flex items-center justify-between shadow-sm">
      {/* --- KIRI --- */}
      <div className="flex flex-col justify-center">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">
          Dashboard Admin
        </h2>
        <p className="text-xs font-medium text-slate-500">{formattedDate}</p>
      </div>

      {/* --- KANAN --- */}
      <div className="flex items-center gap-2">
        {/* 1. NOTIFIKASI REAL-TIME */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-500 hover:text-primary hover:bg-slate-50 rounded-full"
            >
              <Bell className="w-5 h-5" />

              {/* Badge Merah (Hanya muncul jika ada notif) */}
              {totalNotif > 0 && (
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 text-[8px] text-white items-center justify-center font-bold"></span>
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80 p-2">
            <DropdownMenuLabel className="font-bold text-sm mb-2 px-2">
              Notifikasi ({totalNotif})
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {totalNotif === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Tenang, semua aman terkendali! 🎉
              </div>
            ) : (
              <div className="space-y-1">
                {/* Item: Resep */}
                {notifCounts.prescriptions > 0 && (
                  <DropdownMenuItem
                    className="cursor-pointer p-3 flex items-start gap-3 bg-blue-50/50 rounded-lg mb-1"
                    onClick={() => navigate("/admin/verifikasi-resep")}
                  >
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">
                        {notifCounts.prescriptions} Resep Baru
                      </p>
                      <p className="text-xs text-slate-500">
                        Menunggu verifikasi harga dari Anda.
                      </p>
                    </div>
                  </DropdownMenuItem>
                )}

                {/* Item: Pesanan */}
                {notifCounts.orders > 0 && (
                  <DropdownMenuItem
                    className="cursor-pointer p-3 flex items-start gap-3 bg-green-50/50 rounded-lg mb-1"
                    onClick={() => navigate("/admin/orders")}
                  >
                    <div className="p-2 bg-green-100 text-green-600 rounded-full mt-0.5">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">
                        {notifCounts.orders} Pesanan Masuk
                      </p>
                      <p className="text-xs text-slate-500">
                        Segera proses & kirim barang.
                      </p>
                    </div>
                  </DropdownMenuItem>
                )}

                {/* Item: Stok */}
                {notifCounts.lowStock > 0 && (
                  <DropdownMenuItem
                    className="cursor-pointer p-3 flex items-start gap-3 bg-orange-50/50 rounded-lg"
                    onClick={() => navigate("/admin/products")}
                  >
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-full mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">
                        {notifCounts.lowStock} Produk Menipis
                      </p>
                      <p className="text-xs text-slate-500">
                        Stok kurang dari 10. Restock sekarang!
                      </p>
                    </div>
                  </DropdownMenuItem>
                )}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 2. PROFIL ADMIN */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full ml-1 p-0 overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all"
            >
              <Avatar className="h-full w-full">
                <AvatarImage src="https://github.com/shadcn.png" alt="Admin" />
                <AvatarFallback className="bg-primary text-white font-bold">
                  AD
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  Administrator
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  admin@medicgo.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer hover:bg-slate-50">
              <User className="mr-2 h-4 w-4" />
              <span>Profil Saya</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
