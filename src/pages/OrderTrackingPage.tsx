import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Clock,
  Phone,
  MessageCircle,
  CheckCircle,
  Circle,
  Thermometer,
  Package,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { DriverChatModal } from "@/components/chat/DriverChatModal";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DeliveryMapIllustration } from "@/components/tracking/DeliveryMapIllustration";
import { supabase } from "@/lib/supabase";

interface TrackingStep {
  id: string;
  title: string;
  time: string;
  // Status apa saja yang dianggap "sudah melewati" tahap ini
  activeOnStatus: string[];
}

// Interface Data
interface OrderData {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

const OrderTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");

  const [order, setOrder] = useState<OrderData | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // State Visual
  const [progress, setProgress] = useState(10);
  const [estimatedTime, setEstimatedTime] = useState(30);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // --- HELPER: NORMALISASI STATUS (PENTING!) ---
  // Mengubah berbagai variasi status DB menjadi standar kode
  const getNormalizedStatus = (status: string | undefined) => {
    if (!status) return "pending";
    const s = status.toLowerCase();

    if (s === "pending" || s === "menunggu") return "pending";
    if (s === "processing" || s === "diproses" || s === "dikemas")
      return "processing";
    if (s === "shipped" || s === "dikirim" || s === "otw") return "shipped";
    if (s === "delivered" || s === "selesai" || s === "success" || s === "tiba")
      return "delivered";

    return "pending"; // Default
  };

  const currentStatus = getNormalizedStatus(order?.status);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch Order
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (orderError) throw orderError;
        setOrder(orderData);

        // Fetch Items
        const { data: itemsData, error: itemsError } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", orderId);

        if (itemsError) throw itemsError;
        setItems(itemsData || []);

        // Set Progress Awal Visual Map
        const normStatus = getNormalizedStatus(orderData.status);
        if (normStatus === "pending") setProgress(10);
        else if (normStatus === "processing") setProgress(30);
        else if (normStatus === "shipped") setProgress(60);
        else if (normStatus === "delivered") setProgress(100);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // --- 2. ANIMASI MAP (Hanya jalan kalau dikirim) ---
  useEffect(() => {
    if (currentStatus === "shipped") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          // Animasi maju pelan-pelan sampai 90%
          if (prev >= 90) return prev;
          return prev + 0.2;
        });
        setEstimatedTime((prev) => Math.max(prev - 0.1, 5));
      }, 1000);
      return () => clearInterval(interval);
    } else if (currentStatus === "delivered") {
      setProgress(100);
      setEstimatedTime(0);
    }
  }, [currentStatus]);

  // --- CONFIG TIMELINE ---
  // Menentukan status mana saja yang membuat step ini "Done"
  const trackingStepsConfig: TrackingStep[] = [
    {
      id: "1",
      title: "Pesanan Dikonfirmasi",
      time: order?.created_at
        ? new Date(order.created_at).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "--:--",
      activeOnStatus: ["pending", "processing", "shipped", "delivered"],
    },
    {
      id: "2",
      title: "Obat Disiapkan",
      time: "Estimasi 10 menit",
      activeOnStatus: ["processing", "shipped", "delivered"],
    },
    {
      id: "3",
      title: "Kurir Menjemput",
      time: "Estimasi 15 menit",
      activeOnStatus: ["shipped", "delivered"],
    },
    {
      id: "4",
      title: "Dalam Perjalanan",
      time: "Sedang berlangsung",
      activeOnStatus: ["shipped", "delivered"],
    },
    {
      id: "5",
      title: "Tiba di Tujuan",
      time: "Segera",
      activeOnStatus: ["delivered"],
    },
  ];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  if (loading) {
    return (
      <Layout showFooter={false}>
        <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat detail pesanan...</p>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout showFooter={false}>
        <div className="flex h-[80vh] items-center justify-center flex-col gap-4 text-center">
          <Package className="h-16 w-16 text-slate-300" />
          <h2 className="text-xl font-bold">Pesanan Tidak Ditemukan</h2>
          <Button onClick={() => navigate("/")}>Kembali ke Beranda</Button>
        </div>
      </Layout>
    );
  }

  const calculatedSubtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = order.total_amount - calculatedSubtotal;

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-6 relative">
          <Button
            variant="ghost"
            onClick={() => navigate("/pesanan")}
            className="absolute left-0 top-0 md:left-4 md:top-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Kembali</span>
          </Button>
          <div className="pt-8 md:pt-0">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Lacak Pesanan
            </h1>
            <p className="text-muted-foreground">
              No. Pesanan:{" "}
              <span className="font-semibold text-foreground">
                #{order.id.slice(0, 8).toUpperCase()}
              </span>
            </p>
            {/* Badge Status Debugging (Bisa dihapus nanti) */}
            <Badge className="mt-2 bg-slate-100 text-slate-600 border-slate-200">
              Status: {order.status}
            </Badge>
          </div>
        </div>

        {currentStatus !== "delivered" && (
          <div className="bg-card border rounded-2xl p-4 mb-6 flex items-center justify-center gap-3 shadow-sm animate-pulse-slow">
            <Clock className="h-6 w-6 text-primary" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Estimasi tiba</p>
              <p className="text-xl font-bold text-primary">
                {Math.floor(estimatedTime)} - {Math.floor(estimatedTime) + 5}{" "}
                menit
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left Column: Map & Driver */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-card border rounded-2xl overflow-hidden shadow-sm relative">
              {/* Ilustrasi Map bergerak sesuai progress */}
              <DeliveryMapIllustration progress={progress} />

              {/* Overlay jika belum dikirim */}
              {currentStatus === "pending" || currentStatus === "processing" ? (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                  <div className="bg-white px-4 py-2 rounded-full shadow-lg text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menunggu Kurir...
                  </div>
                </div>
              ) : null}
            </div>

            {/* Driver Info - Hanya Muncul Saat Dikirim/Selesai */}
            {(currentStatus === "shipped" || currentStatus === "delivered") && (
              <div className="bg-card border rounded-2xl p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl">🛵</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-secondary rounded-full flex items-center justify-center ring-2 ring-white">
                      <CheckCircle className="h-3 w-3 text-secondary-foreground" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">
                        Budi Santoso
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        Terverifikasi
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Honda Vario • B 1234 ABC
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs gap-1 text-secondary border-secondary bg-secondary/5"
                      >
                        <Thermometer className="h-3 w-3" />
                        Suhu Terjaga: 18°C
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Button variant="outline" className="gap-2">
                    <Phone className="h-4 w-4" />
                    Hubungi
                  </Button>
                  <Button
                    variant="default"
                    className="gap-2"
                    onClick={() => setIsChatOpen(true)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat Driver
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Timeline & Summary */}
          <div className="lg:col-span-2 space-y-4">
            {/* Delivery Status Timeline */}
            <div className="bg-card border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">
                  Status Pengiriman
                </h3>
              </div>

              <div className="space-y-0 pl-2">
                {trackingStepsConfig.map((step, index) => {
                  // Cek apakah step ini aktif berdasarkan status yang dinormalisasi
                  const isCompleted =
                    step.activeOnStatus.includes(currentStatus);

                  // Menentukan step yang paling akhir aktif (Current Active Step)
                  // Logic: Step ini completed, tapi step berikutnya (jika ada) belum completed
                  const nextStep = trackingStepsConfig[index + 1];
                  const isNextCompleted = nextStep
                    ? nextStep.activeOnStatus.includes(currentStatus)
                    : false;
                  const isCurrent = isCompleted && !isNextCompleted;

                  return (
                    <div key={step.id} className="flex gap-3 relative">
                      <div className="flex flex-col items-center">
                        {isCompleted ? (
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center bg-secondary transition-all z-10 ring-4 ring-white`}
                          >
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-slate-300 z-10 ring-4 ring-white" />
                        )}

                        {/* Garis Vertikal */}
                        {index < trackingStepsConfig.length - 1 && (
                          <div
                            className={`w-0.5 h-full absolute top-6 left-[11px] -z-0 ${
                              isCompleted && isNextCompleted
                                ? "bg-secondary"
                                : "bg-slate-200"
                            }`}
                          />
                        )}
                      </div>
                      <div
                        className={`pb-8 -mt-1 flex-1 ${
                          isCompleted ? "opacity-100" : "opacity-40"
                        }`}
                      >
                        <p
                          className={`font-medium text-sm ${
                            isCurrent
                              ? "text-secondary font-bold"
                              : "text-foreground"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isCurrent && currentStatus === "shipped"
                            ? "Sedang dalam proses..."
                            : step.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-card border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">
                  Ringkasan Pesanan
                </h3>
              </div>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm items-start"
                  >
                    <span className="text-foreground">
                      {item.product_name}{" "}
                      <span className="text-muted-foreground text-xs block">
                        x{item.quantity}
                      </span>
                    </span>
                    <span className="font-medium whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(calculatedSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ongkos Kirim</span>
                  <span className="text-secondary font-medium">
                    {deliveryFee <= 0 ? "Gratis" : formatPrice(deliveryFee)}
                  </span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Chat Modal */}
      <DriverChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        driverName="Budi Santoso"
        driverVehicle="Honda Vario • B 1234 ABC"
        estimatedTime={estimatedTime}
      />
    </Layout>
  );
};

export default OrderTrackingPage;
