import React, { useEffect, useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  TrendingUp,
  Activity,
  Users,
  ArrowUpRight,
  FileText, // Icon untuk Resep
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";

// --- INTERFACES ---
interface DashboardStats {
  totalRevenue: number;
  activeOrders: number;
  realActiveOrders: number;
  activePrescriptions: number;
  totalProducts: number;
  lowStock: number;
  totalUsers: number;
}

interface RecentOrder {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
}

interface TopProduct {
  id: string;
  name: string;
  sold: number;
  stock: number;
  image_url: string;
}

// --- CONFIG STATUS WARNA ---
const statusConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  pending: { label: "Menunggu", color: "text-yellow-700", bg: "bg-yellow-100" },
  processing: { label: "Diproses", color: "text-blue-700", bg: "bg-blue-100" },
  paid: { label: "Dibayar", color: "text-emerald-700", bg: "bg-emerald-100" }, // Tambahan
  shipped: { label: "Dikirim", color: "text-purple-700", bg: "bg-purple-100" },
  delivered: { label: "Selesai", color: "text-green-700", bg: "bg-green-100" },
  cancelled: { label: "Batal", color: "text-red-700", bg: "bg-red-100" },
  selesai: { label: "Selesai", color: "text-green-700", bg: "bg-green-100" },
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    activeOrders: 0,
    realActiveOrders: 0,
    activePrescriptions: 0,
    totalProducts: 0,
    lowStock: 0,
    totalUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [revenueChartData, setRevenueChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FUNGSI FETCH DATA (DIPISAH AGAR BISA DI-REFRESH) ---
  const fetchDashboardData = async () => {
    try {
      // 1. FETCH PRODUCTS
      const { data: products } = await supabase
        .from("products")
        .select("id, name, stock, sold, image_url")
        .order("sold", { ascending: false });

      const totalProducts = products?.length || 0;
      const lowStock = products?.filter((p) => p.stock < 10).length || 0;
      const topSelling = products?.slice(0, 5) || [];

      // 2. FETCH ORDERS (Revenue & Chart)
      const { data: orders } = await supabase
        .from("orders")
        .select("id, total_amount, status, created_at")
        .order("created_at", { ascending: false });

      // 3. FETCH PRESCRIPTIONS
      // UPDATE: Hitung 'pending' (butuh harga) DAN 'paid' (butuh dikirim)
      const { count: prescriptionCount } = await supabase
        .from("prescriptions")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "paid"]);

      // 4. FETCH USERS
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .neq("email", "admin@medicgo.com");

      // --- LOGIC PERHITUNGAN ---

      // A. Hitung Pendapatan
      const revenue =
        orders?.reduce((sum, order) => {
          const s = order.status?.toLowerCase() || "";
          const amount = order.total_amount || (order as any).total || 0;
          // Hitung pendapatan jika status delivered/selesai/paid/shipped
          if (
            ["delivered", "selesai", "success", "shipped", "paid"].includes(s)
          ) {
            return sum + amount;
          }
          return sum;
        }, 0) || 0;

      // B. Hitung Active Orders (Barang Fisik)
      const realActiveOrdersCount =
        orders?.filter((o) => {
          const s = o.status?.toLowerCase() || "";
          // Status yang butuh perhatian admin: pending, paid, processing
          return ["pending", "processing", "paid", "dikemas"].includes(s);
        }).length || 0;

      // C. Hitung Chart Data (7 Hari Terakhir)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split("T")[0];
      }).reverse();

      const chartData = last7Days.map((date) => {
        const dailyTotal =
          orders
            ?.filter((o) => {
              const s = o.status?.toLowerCase() || "";
              // Sertakan semua yang sudah dianggap "terjual"
              const isSold = [
                "delivered",
                "selesai",
                "shipped",
                "paid",
              ].includes(s);
              return o.created_at.startsWith(date) && isSold;
            })
            .reduce(
              (sum, o) => sum + (o.total_amount || (o as any).total || 0),
              0
            ) || 0;

        return {
          name: new Date(date).toLocaleDateString("id-ID", {
            weekday: "short",
          }),
          total: dailyTotal,
        };
      });

      // --- SET STATE ---
      setStats({
        totalRevenue: revenue,
        activeOrders: realActiveOrdersCount + (prescriptionCount || 0),
        realActiveOrders: realActiveOrdersCount,
        activePrescriptions: prescriptionCount || 0,
        totalProducts,
        lowStock,
        totalUsers: userCount || 0,
      });

      // Update recent orders list jika loading pertama kali atau data berubah
      setRecentOrders((orders?.slice(0, 5) as RecentOrder[]) || []);
      setTopProducts(topSelling as TopProduct[]);
      setRevenueChartData(chartData);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // --- REAL-TIME UPDATE (Setiap 5 Detik) ---
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- KOMPONEN KARTU STATISTIK ---
  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    bgColor,
    subText,
  }: any) => (
    <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-2xl ${bgColor} ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {subText && <p className="text-xs text-slate-400 mt-1">{subText}</p>}
        </div>
      </CardContent>
    </Card>
  );

  if (loading)
    return (
      <div className="p-8">
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );

  return (
    <div className="space-y-8 p-8 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard Overview
          </h1>
          <p className="text-slate-500">
            Pantau performa bisnis MedicGo secara real-time.
          </p>
        </div>
      </div>

      {/* 1. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Pendapatan"
          value={`Rp ${stats.totalRevenue.toLocaleString("id-ID")}`}
          icon={DollarSign}
          color="text-emerald-600"
          bgColor="bg-emerald-100"
          subText="Dari pesanan selesai & dibayar"
        />

        {/* KARTU GABUNGAN (Opsi A) */}
        <StatCard
          title="Tugas Aktif"
          value={stats.activeOrders}
          icon={ShoppingCart}
          color="text-blue-600"
          bgColor="bg-blue-100"
          subText={`${stats.realActiveOrders} Order + ${stats.activePrescriptions} Resep (Pending/Paid)`}
        />

        <StatCard
          title="Total Produk"
          value={stats.totalProducts}
          icon={Package}
          color="text-violet-600"
          bgColor="bg-violet-100"
          subText={`${stats.lowStock} Perlu Restock`}
        />

        <StatCard
          title="Pelanggan"
          value={stats.totalUsers}
          icon={Users}
          color="text-orange-600"
          bgColor="bg-orange-100"
          subText="User terdaftar (Non-Admin)"
        />
      </div>

      {/* 2. CHART & TOP PRODUCTS */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        {/* Chart Pendapatan */}
        <Card className="lg:col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Tren Pendapatan</CardTitle>
            <CardDescription>
              Performa penjualan 7 hari terakhir
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `Rp${value / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `Rp ${value.toLocaleString("id-ID")}`,
                      "Pendapatan",
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Produk Terlaris */}
        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Produk Terlaris</CardTitle>
            <CardDescription>Top 5 produk penjualan tertinggi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">
                  Belum ada data penjualan.
                </p>
              ) : (
                topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <div className="font-bold text-slate-400 w-4 text-center">
                      #{index + 1}
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          (e.currentTarget.src =
                            "https://via.placeholder.com/40")
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Stok: {product.stock}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{product.sold}</p>
                      <p className="text-xs text-muted-foreground">Terjual</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. PESANAN TERBARU & LOW STOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pesanan Terbaru</CardTitle>
            <Link to="/admin/orders">
              <button className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                Lihat Semua <ArrowUpRight className="w-4 h-4" />
              </button>
            </Link>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => {
                  const s = order.status?.toLowerCase() || "";
                  const config = statusConfig[s] || {
                    label: order.status,
                    bg: "bg-gray-100",
                    color: "text-gray-700",
                  };
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(order.created_at).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}
                        >
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        Rp{" "}
                        {(
                          order.total_amount ||
                          (order as any).total ||
                          0
                        ).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ALERT LOW STOCK */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" /> Perlu Restock
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.lowStock > 0 ? (
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 text-center">
                  <h3 className="text-3xl font-bold text-orange-600 mb-1">
                    {stats.lowStock}
                  </h3>
                  <p className="text-orange-800 text-sm font-medium">
                    Produk Hampir Habis
                  </p>
                  <p className="text-orange-600/80 text-xs mt-1">
                    Stok di bawah 10 unit
                  </p>
                </div>
                <Link to="/admin/products" className="block">
                  <button className="w-full py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                    Lihat Detail Stok
                  </button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-green-800 font-medium">Semua stok aman!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
