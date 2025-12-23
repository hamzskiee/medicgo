import React, { useEffect, useState } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Loader2,
  DollarSign,
  X,
  CreditCard,
  MapPin,
  Truck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// --- INTERFACE UPDATE ---
interface Prescription {
  id: string;
  created_at: string;
  user_id: string;
  image_url: string;
  status:
    | "pending"
    | "processing"
    | "rejected"
    | "completed"
    | "paid"
    | "approved"; // Tambah status 'paid' & 'approved'
  patient_name?: string;
  patient_age?: number;
  notes?: string;
  pharmacist_notes?: string;
  price?: number;
  payment_method?: string; // Tambahan Kolom Baru
  shipping_address?: string; // Tambahan Kolom Baru
  user?: {
    email: string;
    full_name: string;
    phone: string;
  };
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
    label: "Diproses (Menunggu Bayar)",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    icon: FileText,
  },
  paid: {
    // Status Baru
    label: "SUDAH DIBAYAR",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    icon: CreditCard,
  },
  rejected: {
    label: "Ditolak",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    icon: XCircle,
  },
  completed: {
    label: "Selesai (Dikirim)",
    color: "text-slate-700",
    bg: "bg-slate-100 border-slate-200",
    icon: CheckCircle,
  },
};

export default function AdminPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pharmacistNotes, setPharmacistNotes] = useState("");
  const [priceInput, setPriceInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  // --- FETCH DATA ---
  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("prescriptions")
        .select(`*, user:profiles (email, full_name, phone)`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrescriptions((data as any) || []);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data resep");
    } finally {
      setLoading(false);
    }
  };
  //auto refresh data atmin 5 detik
  useEffect(() => {
    fetchPrescriptions();
    const interval = setInterval(() => {
      if (!isDialogOpen) {
        fetchPrescriptions();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isDialogOpen]);

  // --- UPDATE STATUS ---
  const handleUpdateStatus = async (
    newStatus: "processing" | "rejected" | "completed"
  ) => {
    if (!selectedPrescription) return;

    if (newStatus === "rejected" && !pharmacistNotes.trim()) {
      toast.error("Wajib mengisi alasan penolakan.");
      return;
    }

    if (
      newStatus === "processing" &&
      (!priceInput || parseInt(priceInput) <= 0)
    ) {
      toast.warning("Mohon masukkan estimasi harga obat.");
      return;
    }

    try {
      setIsSubmitting(true);

      const updateData: any = {
        status: newStatus,
        pharmacist_notes: pharmacistNotes,
      };

      if (newStatus === "processing" || newStatus === "completed") {
        updateData.price = parseInt(priceInput) || 0;
      }

      const { error } = await supabase
        .from("prescriptions")
        .update(updateData)
        .eq("id", selectedPrescription.id);

      if (error) throw error;

      setPrescriptions((prev) =>
        prev.map((item) =>
          item.id === selectedPrescription.id
            ? { ...item, ...updateData }
            : item
        )
      );

      toast.success("Status resep berhasil diperbarui!");
      closeDialog();
    } catch (error: any) {
      toast.error("Gagal update: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDialog = (p: Prescription) => {
    setSelectedPrescription(p);
    setPharmacistNotes(p.pharmacist_notes || "");
    setPriceInput(p.price ? p.price.toString() : "");
    setIsImageZoomed(false);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => {
      setSelectedPrescription(null);
      setPharmacistNotes("");
      setPriceInput("");
    }, 300);
  };

  const filteredPrescriptions = prescriptions.filter((p) => {
    // Filter Status: Jika 'paid', tampilkan juga 'completed' (opsional)
    if (statusFilter !== "all" && p.status !== statusFilter) return false;

    const searchLower = searchQuery.toLowerCase();
    return (
      (p.patient_name || "").toLowerCase().includes(searchLower) ||
      (p.user?.full_name || "").toLowerCase().includes(searchLower) ||
      p.id.toLowerCase().includes(searchLower)
    );
  });

  const pendingCount = prescriptions.filter(
    (p) => p.status === "pending"
  ).length;
  const paidCount = prescriptions.filter((p) => p.status === "paid").length; // Counter Paid

  return (
    <div className="space-y-8 min-h-screen bg-slate-50/50 p-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Verifikasi Resep
          </h1>
          <p className="text-slate-500 mt-1">
            Kelola resep dan berikan rincian harga obat.
          </p>
        </div>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium text-sm animate-pulse">
              <AlertTriangle className="w-4 h-4" /> {pendingCount} Menunggu
            </div>
          )}
          {paidCount > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium text-sm animate-pulse">
              <CreditCard className="w-4 h-4" /> {paidCount} Perlu Dikirim
            </div>
          )}
        </div>
      </div>

      {/* TABS FILTER */}
      <Tabs
        defaultValue="all"
        value={statusFilter}
        onValueChange={setStatusFilter}
        className="w-full"
      >
        <TabsList className="bg-white border p-1 h-auto rounded-xl flex flex-wrap gap-1">
          <TabsTrigger value="all" className="flex-1">
            Semua
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="flex-1 data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-800"
          >
            Menunggu
          </TabsTrigger>
          <TabsTrigger
            value="processing"
            className="flex-1 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800"
          >
            Diproses
          </TabsTrigger>
          <TabsTrigger
            value="paid"
            className="flex-1 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800 font-bold"
          >
            SUDAH DIBAYAR
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="flex-1 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-800"
          >
            Selesai
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="flex-1 data-[state=active]:bg-red-100 data-[state=active]:text-red-800"
          >
            Ditolak
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* SEARCH */}
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Cari nama pasien atau ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {/* GRID CARD */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed rounded-xl text-slate-500">
          Tidak ada data resep.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {filteredPrescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full relative"
            >
              {/* Badge Status di Pojok */}
              <div className="absolute top-3 left-3 z-10">
                <Badge
                  className={cn(
                    "shadow-sm",
                    statusConfig[prescription.status]?.bg || "bg-gray-100",
                    statusConfig[prescription.status]?.color || "text-gray-700"
                  )}
                >
                  {statusConfig[prescription.status]?.label ||
                    prescription.status}
                </Badge>
              </div>

              {/* Image */}
              <div
                className="h-48 bg-slate-100 overflow-hidden cursor-pointer relative"
                onClick={() => openDialog(prescription)}
              >
                <img
                  src={prescription.image_url}
                  alt="Resep"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="sm" variant="secondary" className="shadow-lg">
                    <Eye className="w-4 h-4 mr-2" /> Lihat Detail
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {prescription.patient_name ||
                        prescription.user?.full_name ||
                        "Tanpa Nama"}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {prescription.user?.phone || "-"}
                    </p>
                  </div>
                  {prescription.price && prescription.price > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Tagihan</p>
                      <p className="font-bold text-green-700">
                        Rp {prescription.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                  )}
                </div>

                {/* INFO PEMBAYARAN (Hanya muncul jika sudah dibayar) */}
                {prescription.status === "paid" && (
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-sm space-y-1">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <CheckCircle className="w-4 h-4" /> PEMBAYARAN DITERIMA
                    </div>
                    <p className="text-emerald-700 text-xs">
                      Metode:{" "}
                      <span className="font-mono uppercase">
                        {prescription.payment_method || "-"}
                      </span>
                    </p>
                    <p className="text-emerald-700 text-xs line-clamp-1">
                      Alamat: {prescription.shipping_address || "-"}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t bg-slate-50/50">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => openDialog(prescription)}
                >
                  Kelola Resep
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL DETAIL --- */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden h-[90vh] sm:h-auto flex flex-col sm:grid sm:grid-cols-5 gap-0">
          {/* KOLOM KIRI (GAMBAR) */}
          <div
            className="relative bg-slate-900 sm:col-span-3 h-64 sm:h-[600px] flex items-center justify-center cursor-zoom-in group"
            onClick={() => setIsImageZoomed(true)}
          >
            <img
              src={selectedPrescription?.image_url}
              alt="Detail"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 pointer-events-none">
              <Eye className="w-6 h-6" /> Klik untuk Perbesar
            </div>
          </div>

          {/* KOLOM KANAN (FORM) */}
          {selectedPrescription && (
            <div className="sm:col-span-2 flex flex-col h-full bg-white border-l border-slate-200 overflow-y-auto">
              <DialogHeader className="p-5 border-b sticky top-0 bg-white z-10">
                <DialogTitle>Detail Resep</DialogTitle>
                <div className="flex gap-2 mt-2">
                  <Badge
                    className={
                      statusConfig[selectedPrescription.status]?.bg +
                      " " +
                      statusConfig[selectedPrescription.status]?.color
                    }
                  >
                    {statusConfig[selectedPrescription.status]?.label}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="p-5 space-y-6">
                {/* INFO PASIEN */}
                <div className="space-y-1">
                  <Label className="text-slate-500 text-xs uppercase">
                    Data Pasien
                  </Label>
                  <p className="font-bold text-slate-900">
                    {selectedPrescription.patient_name ||
                      selectedPrescription.user?.full_name}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="w-3 h-3" />{" "}
                    {selectedPrescription.user?.email}
                  </div>
                </div>

                <Separator />

                {/* INFO PENGIRIMAN (KHUSUS STATUS PAID) */}
                {selectedPrescription.status === "paid" && (
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 space-y-3">
                    <h4 className="font-bold text-yellow-800 flex items-center gap-2">
                      <Truck className="w-4 h-4" /> Perlu Dikirim
                    </h4>
                    <div>
                      <Label className="text-xs text-yellow-700">
                        Alamat Pengiriman
                      </Label>
                      <p className="text-sm text-slate-800 mt-1 leading-relaxed bg-white/50 p-2 rounded border border-yellow-100">
                        {selectedPrescription.shipping_address ||
                          "Alamat tidak ditemukan"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-yellow-700">
                        Metode Pembayaran
                      </Label>
                      <Badge variant="outline" className="ml-2 bg-white">
                        {selectedPrescription.payment_method || "Manual"}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* FORM APOTEKER */}
                <div className="space-y-4">
                  <div>
                    <Label>Catatan / Rekomendasi Obat</Label>
                    <Textarea
                      placeholder="Contoh: Paracetamol 500mg (3x1), Amoxicillin (Habiskan)"
                      className="mt-1.5 min-h-[100px]"
                      value={pharmacistNotes}
                      onChange={(e) => setPharmacistNotes(e.target.value)}
                      disabled={selectedPrescription.status === "completed"}
                    />
                  </div>
                  <div>
                    <Label>Total Tagihan (Rp)</Label>
                    <div className="relative mt-1.5">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="number"
                        className="pl-9 font-bold font-mono"
                        placeholder="0"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        disabled={selectedPrescription.status === "completed"}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-auto p-5 border-t bg-slate-50 sticky bottom-0">
                {selectedPrescription.status === "pending" && (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="destructive"
                      onClick={() => handleUpdateStatus("rejected")}
                      disabled={isSubmitting}
                    >
                      Tolak
                    </Button>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleUpdateStatus("processing")}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Proses & Tagih"
                      )}
                    </Button>
                  </div>
                )}
                {/* JIKA SUDAH DIBAYAR -> Admin klik 'Selesai' tanda obat dikirim */}
                {(selectedPrescription.status === "processing" ||
                  selectedPrescription.status === "paid") && (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
                    onClick={() => handleUpdateStatus("completed")}
                    disabled={isSubmitting}
                  >
                    <CheckCircle className="w-5 h-5 mr-2" /> Tandai Selesai /
                    Dikirim
                  </Button>
                )}
                {selectedPrescription.status === "completed" && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={closeDialog}
                  >
                    Tutup
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ZOOM MODAL (Tetap Sama) */}
      {isImageZoomed && selectedPrescription && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setIsImageZoomed(false)}
        >
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-6 right-6 rounded-full"
            onClick={() => setIsImageZoomed(false)}
          >
            <X className="w-6 h-6" />
          </Button>
          <img
            src={selectedPrescription.image_url}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
