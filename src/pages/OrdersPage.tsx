import React, { useEffect, useState } from "react";
import {
  Package,
  CheckCircle,
  Truck,
  Clock,
  XCircle,
  Eye,
  ShoppingBag,
  FileText,
  ChevronRight,
  Receipt,
  CreditCard,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

// --- TYPE DEFINITIONS ---
type OrderType = "product_order" | "prescription";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface UnifiedOrder {
  id: string;
  type: OrderType;
  created_at: string;
  status: string;
  total?: number;
  image_url?: string;
  items_count?: number;
  items?: OrderItem[];
}

// --- CONFIG STATUS ---
const statusConfig: Record<
  string,
  { label: string; color: string; icon: any; bg: string }
> = {
  pending: {
    label: "Menunggu",
    color: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-200",
    icon: Clock,
  },
  processing: {
    label: "Diproses",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    icon: Package,
  },
  shipped: {
    label: "Dikirim",
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-200",
    icon: Truck,
  },
  delivered: {
    label: "Selesai",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    icon: CheckCircle,
  },
  // Status Resep
  approved: {
    label: "Siap Bayar",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    icon: CreditCard,
  },
  paid: {
    label: "Dibayar",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    icon: CheckCircle,
  },
  completed: {
    label: "Selesai",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    icon: CheckCircle,
  },
  rejected: {
    label: "Ditolak",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    icon: XCircle,
  },
  default: {
    label: "Status Unknown",
    color: "text-slate-700",
    bg: "bg-slate-50 border-slate-200",
    icon: Package,
  },
};

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<UnifiedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const fetchMyOrders = async () => {
    if (!user) return;

    try {
      // 1. Ambil Order Produk
      const { data: productOrders } = await supabase
        .from("orders")
        .select(
          `id, created_at, status, total_amount, items:order_items (id, product_name, quantity, price)`
        )
        .eq("user_id", user.id);

      // 2. Ambil Resep
      const { data: prescriptions } = await supabase
        .from("prescriptions")
        .select("id, created_at, status, image_url, price")
        .eq("user_id", user.id);

      // 3. Mapping Data
      const mappedProducts: UnifiedOrder[] = (productOrders || []).map(
        (o: any) => ({
          id: o.id,
          type: "product_order",
          created_at: o.created_at,
          status: o.status || "pending",
          total: o.total_amount,
          items_count: o.items?.length || 0,
          items: o.items,
        })
      );

      const mappedPrescriptions: UnifiedOrder[] = (prescriptions || []).map(
        (p: any) => ({
          id: p.id,
          type: "prescription",
          created_at: p.created_at,
          status: p.status || "pending",
          image_url: p.image_url,
          total: p.price || 0,
        })
      );

      const combined = [...mappedProducts, ...mappedPrescriptions].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setOrders(combined);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchMyOrders();
    const interval = setInterval(fetchMyOrders, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const getStatus = (statusKey: string) => {
    return statusConfig[statusKey?.toLowerCase()] || statusConfig["default"];
  };

  // --- NAVIGASI KE CHECKOUT ---
  const handlePayPrescription = (order: UnifiedOrder) => {
    navigate("/checkout", {
      state: {
        directPurchase: true,
        items: [
          {
            product: {
              id: order.id,
              name: "Tebus Resep Dokter",
              price: order.total || 0,
              image: "/medicgo-logo.png", // Atau gambar default obat
              category: "Resep",
            },
            quantity: 1,
          },
        ],
        totalAmount: order.total || 0,
        orderId: order.id,
      },
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 min-h-screen max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Pesanan Saya</h1>
            <p className="text-slate-500 mt-1">
              Riwayat belanja obat & resep dokter
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              fetchMyOrders();
            }}
          >
            Refresh
          </Button>
        </div>

        {loading && orders.length === 0 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-slate-100 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <ShoppingBag className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-900">
              Belum ada pesanan
            </h3>
            <p className="text-slate-500 mt-2">
              Yuk, mulai belanja obat atau upload resep dokter!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const status = getStatus(order.status);
              const StatusIcon = status.icon;

              const showPrice =
                order.type === "product_order" ||
                (order.type === "prescription" && (order.total || 0) > 0);

              const showPayButton =
                order.type === "prescription" &&
                (order.total || 0) > 0 &&
                (order.status === "processing" ||
                  order.status === "approved" ||
                  order.status === "menunggu pembayaran");

              return (
                <div
                  key={order.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    {/* --- KIRI --- */}
                    <div className="flex gap-4">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                          order.type === "prescription"
                            ? "bg-blue-50 text-blue-600 border-blue-100"
                            : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        )}
                      >
                        {order.type === "prescription" ? (
                          <FileText className="w-6 h-6" />
                        ) : (
                          <ShoppingBag className="w-6 h-6" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900">
                            {order.type === "prescription"
                              ? "Resep Dokter"
                              : "Pembelian Obat"}
                          </h3>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] px-2 py-0.5 h-fit font-medium",
                              status.bg,
                              status.color
                            )}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {new Date(order.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          ID: #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {/* --- KANAN (HARGA & TOMBOL) --- */}
                    <div className="flex flex-col md:items-end justify-between gap-4 mt-2 md:mt-0">
                      {/* TAMPILAN HARGA */}
                      {showPrice && (
                        <div className="text-left md:text-right">
                          <p className="text-xs text-slate-500 mb-0.5">
                            {order.type === "prescription"
                              ? "Total Tagihan"
                              : "Total Belanja"}
                          </p>
                          <p className="text-lg font-bold text-slate-900">
                            {formatPrice(order.total || 0)}
                          </p>
                        </div>
                      )}

                      {/* ACTIONS */}
                      <div className="flex gap-2 items-center">
                        {/* --- TOMBOL BAYAR SEKARANG --- */}
                        {showPayButton && (
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 animate-pulse shadow-md"
                            onClick={() => handlePayPrescription(order)}
                          >
                            Bayar Sekarang
                          </Button>
                        )}
                        {/* ----------------------------- */}

                        {/* Detail Pembelian Obat */}
                        {order.type === "product_order" && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 gap-2"
                              >
                                <Receipt className="w-4 h-4 text-slate-500" />
                                Lihat Detail
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <ShoppingBag className="w-5 h-5 text-primary" />
                                  Rincian Pesanan
                                </DialogTitle>
                                <DialogDescription>
                                  Detail item yang Anda beli pada transaksi ini.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                {order.items?.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between items-start text-sm border-b border-slate-50 pb-3 last:border-0"
                                  >
                                    <div>
                                      <p className="font-medium text-slate-900">
                                        {item.product_name}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        {item.quantity} barang x{" "}
                                        {formatPrice(item.price)}
                                      </p>
                                    </div>
                                    <p className="font-semibold text-slate-700">
                                      {formatPrice(item.quantity * item.price)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                              <Separator />
                              <div className="flex justify-between items-center pt-2">
                                <span className="font-bold text-slate-700">
                                  Total
                                </span>
                                <span className="font-bold text-xl text-primary">
                                  {formatPrice(order.total || 0)}
                                </span>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {/* Lihat Foto Resep */}
                        {order.type === "prescription" && order.image_url && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                              >
                                <Eye className="w-4 h-4" /> Lihat Foto
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Foto Resep</DialogTitle>
                              </DialogHeader>
                              <div className="mt-2 flex justify-center bg-slate-100 rounded-lg overflow-hidden border">
                                <img
                                  src={order.image_url}
                                  alt="Resep"
                                  className="max-h-[70vh] w-auto object-contain"
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {/* Lacak Pesanan (UPDATED: Use navigate instead of window.location.href) */}
                        {(order.status === "shipped" ||
                          order.status === "delivered" ||
                          order.status === "dikirim" ||
                          order.status === "selesai") && (
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/lacak-pesanan?id=${order.id}`);
                            }}
                          >
                            Lacak <ChevronRight className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrdersPage;
