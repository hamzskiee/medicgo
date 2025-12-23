import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Home,
  Briefcase,
  MoreVertical,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// Interface Sesuai Database Anda
interface Address {
  id: string;
  label: string;
  recipient_name: string;
  phone_number: string; // Sesuai DB
  address_line: string; // Sesuai DB
  city: string;
  province: string; // Sesuai DB
  postal_code: string;
  is_default: boolean;
}

const AddressPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    label: "Rumah",
    recipient_name: "",
    phone_number: "",
    address_line: "",
    city: "",
    province: "",
    postal_code: "",
  });

  // --- 1. READ (Ambil Data) ---
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // --- 2. CREATE (Tambah Data) ---
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User tidak ditemukan");

      // Jika alamat pertama, otomatis jadi default
      const isFirst = addresses.length === 0;

      const { error } = await supabase.from("addresses").insert({
        user_id: user.id,
        label: formData.label,
        recipient_name: formData.recipient_name,
        phone_number: formData.phone_number, // Masuk ke kolom phone_number
        address_line: formData.address_line, // Masuk ke kolom address_line
        city: formData.city,
        province: formData.province, // Masuk ke kolom province
        postal_code: formData.postal_code,
        is_default: isFirst,
      });

      if (error) throw error;

      toast.success("Alamat berhasil disimpan!");
      setIsDialogOpen(false);
      // Reset form
      setFormData({
        label: "Rumah",
        recipient_name: "",
        phone_number: "",
        address_line: "",
        city: "",
        province: "",
        postal_code: "",
      });
      fetchAddresses();
    } catch (error: any) {
      toast.error("Gagal simpan: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- 3. UPDATE (Set Default) ---
  const handleSetDefault = async (id: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Reset semua jadi false
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);

      // Set yang dipilih jadi true
      const { error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", id);

      if (error) throw error;

      toast.success("Alamat utama diperbarui");
      fetchAddresses();
    } catch (error: any) {
      toast.error("Gagal update: " + error.message);
    }
  };

  // --- 4. DELETE (Hapus Data) ---
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus alamat ini?")) return;

    try {
      const { error } = await supabase.from("addresses").delete().eq("id", id);
      if (error) throw error;
      toast.success("Alamat dihapus");
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profil")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Daftar Alamat</h1>
            <p className="text-muted-foreground text-sm">
              Kelola alamat pengiriman Anda
            </p>
          </div>
        </div>

        {/* --- DAFTAR ALAMAT --- */}
        <div className="space-y-4">
          {/* Tombol Tambah (Dialog) */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-12 border-dashed border-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-300 shadow-none cursor-pointer">
                <Plus className="mr-2 h-4 w-4" /> Tambah Alamat Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Alamat Pengiriman</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddAddress} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Label Alamat</Label>
                    <Input
                      placeholder="Contoh: Rumah, Kantor"
                      value={formData.label}
                      onChange={(e) =>
                        setFormData({ ...formData, label: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Penerima</Label>
                    <Input
                      placeholder="Nama Penerima"
                      value={formData.recipient_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recipient_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nomor Telepon</Label>
                  <Input
                    placeholder="08..."
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alamat Lengkap</Label>
                  <Textarea
                    placeholder="Nama Jalan, No. Rumah, RT/RW..."
                    value={formData.address_line}
                    onChange={(e) =>
                      setFormData({ ...formData, address_line: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Provinsi</Label>
                    <Input
                      placeholder="Jawa Barat"
                      value={formData.province}
                      onChange={(e) =>
                        setFormData({ ...formData, province: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Kota / Kab</Label>
                    <Input
                      placeholder="Bekasi"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Kode Pos</Label>
                  <Input
                    placeholder="17510"
                    value={formData.postal_code}
                    onChange={(e) =>
                      setFormData({ ...formData, postal_code: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Simpan Alamat"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* List Item */}
          {loading ? (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Belum ada alamat tersimpan.
            </div>
          ) : (
            addresses.map((addr) => (
              <Card
                key={addr.id}
                className={`overflow-hidden transition-all ${
                  addr.is_default
                    ? "border-primary ring-1 ring-primary bg-primary/5"
                    : "hover:border-slate-300"
                }`}
              >
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="mt-1">
                    {addr.label.toLowerCase().includes("kantor") ? (
                      <Briefcase className="h-5 w-5 text-slate-500" />
                    ) : (
                      <Home className="h-5 w-5 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {addr.label}
                      </span>
                      {addr.is_default && (
                        <Badge variant="default" className="text-[10px] h-5">
                          Utama
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium text-sm text-slate-900">
                      {addr.recipient_name}{" "}
                      <span className="text-slate-400 font-normal">
                        | {addr.phone_number}
                      </span>
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                      {addr.address_line}, {addr.city}, {addr.province}{" "}
                      {addr.postal_code}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer"
                      >
                        <MoreVertical className="h-4 w-4 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!addr.is_default && (
                        <DropdownMenuItem
                          onClick={() => handleSetDefault(addr.id)}
                          className="cursor-pointer"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Jadikan
                          Utama
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 cursor-pointer"
                        onClick={() => handleDelete(addr.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AddressPage;
