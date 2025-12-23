import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Package,
  MapPin,
  Receipt,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

// --- INTERFACE ---
interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  items: OrderItem[]; // Array detail barang
  user_id: string;
  shipping_address?: string;
  payment_method?: string;
}

// --- CONFIG STATUS ---
const statusConfig: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  pending: {
    label: "Menunggu",
    color:
      "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
    icon: Clock,
  },
  processing: {
    label: "Diproses",
    color: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
    icon: Truck,
  },
  shipped: {
    label: "Dikirim",
    color:
      "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100",
    icon: Truck,
  },
  delivered: {
    label: "Selesai",
    color: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Dibatalkan",
    color: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
    icon: XCircle,
  },
  // Fallback
  default: {
    label: "Unknown",
    color: "bg-slate-100 text-slate-800 border-slate-200",
    icon: Package,
  },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // State untuk Dialog Detail
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  // --- FETCH ORDERS ---
  const fetchOrders = async () => {
    try {
      setLoading(true);

      // QUERY MODIFIED: Join dengan order_items
      let query = supabase
        .from("orders")
        .select(
          `
          *,
          items:order_items (
            id,
            product_name,
            quantity,
            price
          )
        `
        )
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Gagal mengambil pesanan:", error);
      toast({
        title: "Gagal memuat data",
        description: "Periksa koneksi internet Anda.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // REALTIME LISTENER
    const channel = supabase
      .channel("realtime-orders-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders() // Refresh full data to get items join
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- UPDATE STATUS ---
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      // Optimistic Update
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      toast({
        title: "Status Diperbarui",
        description: `Pesanan diperbarui menjadi ${newStatus}.`,
      });
    } catch (error) {
      toast({
        title: "Gagal update status",
        variant: "destructive",
      });
    }
  };

  // --- EXPORT CSV ---
  const handleExportCSV = () => {
    if (orders.length === 0) {
      toast({ title: "Tidak ada data", variant: "destructive" });
      return;
    }
    const headers = [
      "Order ID",
      "Tanggal",
      "Total Amount",
      "Status",
      "Items",
      "Alamat",
    ];
    const rows = orders.map((order) => [
      order.id,
      new Date(order.created_at).toLocaleDateString("id-ID"),
      order.total_amount,
      order.status,
      `"${order.items
        .map((i) => `${i.product_name} (${i.quantity})`)
        .join(", ")}"`,
      `"${order.shipping_address || "-"}"`,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `MedicGo_Orders_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- FILTER CLIENT SIDE ---
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 p-8 min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Manajemen Pesanan
          </h1>
          <p className="text-slate-500">
            Kelola transaksi masuk & update status pengiriman.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchOrders} disabled={loading}>
            Refresh
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 gap-2"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari ID Order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2 text-slate-500" />
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Menunggu</SelectItem>
            <SelectItem value="processing">Diproses</SelectItem>
            <SelectItem value="shipped">Dikirim</SelectItem>
            <SelectItem value="delivered">Selesai</SelectItem>
            <SelectItem value="cancelled">Dibatalkan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead>Order ID</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-slate-500"
                >
                  Tidak ada pesanan ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const config =
                  statusConfig[order.status] || statusConfig.default;
                const StatusIcon = config.icon;

                return (
                  <TableRow key={order.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-600">
                        {order.items?.length || 0} Barang
                      </span>
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">
                      {formatPrice(order.total_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`px-2.5 py-0.5 rounded-full font-medium border ${config.color}`}
                      >
                        <StatusIcon className="w-3 h-3 mr-1.5 inline-block" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {/* TOMBOL LIHAT DETAIL */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-600 hover:bg-blue-50"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDetailOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4 text-slate-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                updateOrderStatus(order.id, "processing")
                              }
                            >
                              <Truck className="mr-2 h-4 w-4 text-blue-500" />{" "}
                              Proses
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateOrderStatus(order.id, "shipped")
                              }
                            >
                              <Truck className="mr-2 h-4 w-4 text-purple-500" />{" "}
                              Kirim
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateOrderStatus(order.id, "delivered")
                              }
                            >
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />{" "}
                              Selesai
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                updateOrderStatus(order.id, "cancelled")
                              }
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" /> Batalkan
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- DIALOG DETAIL ORDER --- */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Detail Pesanan
            </DialogTitle>
            <DialogDescription>
              ID: #{selectedOrder?.id.slice(0, 8).toUpperCase()}
            </DialogDescription>
          </DialogHeader>

          {/* List Barang */}
          <div className="mt-4 max-h-[50vh] overflow-y-auto pr-2 space-y-4">
            {selectedOrder?.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-start text-sm border-b border-slate-100 pb-3 last:border-0"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.quantity} x {formatPrice(item.price)}
                  </p>
                </div>
                <p className="font-semibold text-slate-700">
                  {formatPrice(item.quantity * item.price)}
                </p>
              </div>
            ))}
          </div>

          <Separator />

          {/* Info Pengiriman & Total */}
          <div className="space-y-3 pt-2">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    Alamat Pengiriman
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedOrder?.shipping_address || "Alamat tidak tersedia"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="font-bold text-slate-700">Total Transaksi</span>
              <span className="font-bold text-xl text-primary">
                {selectedOrder && formatPrice(selectedOrder.total_amount)}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
