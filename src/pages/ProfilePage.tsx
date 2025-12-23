import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  Package,
  LogOut,
  ShieldCheck,
  AlertTriangle,
  Camera,
  Save,
  X,
  Loader2,
  Edit3,
  Home,
  Smartphone, // Icon HP
  KeyRound, // Icon OTP
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
// HAPUS IMPORT INI KARENA KITA PAKAI LOGIC DI DALAM FILE SAJA
// import { PhoneVerification } from "@/components/profile/PhoneVerification";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Interface Profil
interface ProfileData {
  full_name: string;
  phone: string;
  email: string;
  avatar_url?: string;
}

// Interface Alamat
interface AddressData {
  id: string;
  recipient_name: string;
  phone_number: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
  label: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  // State Data
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    phone: "",
    email: "",
  });
  const [defaultAddress, setDefaultAddress] = useState<AddressData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // --- STATE UNTUK DIALOG VERIFIKASI (DEMO) ---
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifyStep, setVerifyStep] = useState<"INPUT_PHONE" | "INPUT_OTP">(
    "INPUT_PHONE"
  );
  const [inputPhone, setInputPhone] = useState("");
  const [inputOtp, setInputOtp] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // 1. Ambil Profil
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileData) {
            setProfile({
              full_name:
                profileData.full_name || user.user_metadata?.name || "",
              phone: profileData.phone || user.phone || "",
              email: user.email || "",
              avatar_url: profileData.avatar_url,
            });
            // Cek status verifikasi (Database ATAU LocalStorage simulasi)
            const isVerified =
              user.user_metadata?.phone_verified ||
              localStorage.getItem("phoneVerified") === "true";
            setPhoneVerified(isVerified);

            // Isi input phone untuk dialog verifikasi
            setInputPhone(profileData.phone || "");
          }

          // 2. Ambil Alamat Utama
          const { data: addressData } = await supabase
            .from("addresses")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_default", true)
            .single();

          if (addressData) {
            setDefaultAddress(addressData);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate]);

  // --- LOGIC VERIFIKASI DEMO ---
  const handleSendOtp = () => {
    if (!inputPhone || inputPhone.length < 10) {
      toast.error("Nomor telepon tidak valid");
      return;
    }
    setVerifyLoading(true);
    // Simulasi Kirim OTP
    setTimeout(() => {
      setVerifyLoading(false);
      setVerifyStep("INPUT_OTP");
      toast.success("OTP Terkirim! Gunakan kode: 123456");
    }, 1500);
  };

  const handleVerifyOtp = () => {
    setVerifyLoading(true);
    // Simulasi Cek OTP
    setTimeout(() => {
      if (inputOtp === "123456") {
        setPhoneVerified(true);
        setVerifyLoading(false);
        setShowVerifyDialog(false);
        localStorage.setItem("phoneVerified", "true"); // Simpan sementara di browser
        toast.success("Nomor telepon berhasil diverifikasi!");

        // Update phone number di profil juga jika berubah
        if (inputPhone !== profile.phone) {
          setProfile((prev) => ({ ...prev, phone: inputPhone }));
          // Optional: Save to DB here
        }
      } else {
        setVerifyLoading(false);
        toast.error("Kode OTP Salah");
      }
    }, 1500);
  };

  // --- UPDATE PROFIL ---
  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: profile.full_name,
        phone: profile.phone,
        updated_at: new Date(),
      });

      if (error) throw error;
      toast.success("Profil berhasil diperbarui!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error("Gagal update: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* === HEADER SECTION === */}
        <div className="relative z-0 mb-8 rounded-2xl bg-slate-50/80 backdrop-blur border border-slate-200 p-8 shadow-md">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group cursor-pointer">
              <Avatar className="h-24 w-24 border border-slate-100 shadow-md">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-3xl font-bold bg-slate-50 text-slate-700">
                  {profile.full_name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-white text-slate-600 border border-slate-200 p-1.5 rounded-full shadow-sm hover:bg-slate-50 transition">
                <Camera className="h-4 w-4" />
              </div>
            </div>

            {/* Info User */}
            <div className="text-center md:text-left space-y-1 flex-1">
              <h1 className="text-2xl font-bold text-slate-900">
                {profile.full_name || "Pengguna Baru"}
              </h1>
              <p className="text-slate-500">{profile.email}</p>

              <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                {phoneVerified ? (
                  <Badge
                    variant="outline"
                    className="border-green-200 bg-green-50 text-green-700 font-normal"
                  >
                    <ShieldCheck className="h-3 w-3 mr-1" /> Terverifikasi
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-amber-200 bg-amber-50 text-amber-700 font-normal cursor-pointer hover:bg-amber-100"
                    onClick={() => setShowVerifyDialog(true)}
                  >
                    Belum Verifikasi (Klik)
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* === CONTENT GRID === */}
        <div className="grid md:grid-cols-3 gap-8 relative z-20">
          {/* Kolom Kiri: Menu Profil */}
          <div className="space-y-6">
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Menu Profil</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-1">
                <Button
                  variant="ghost"
                  className="justify-start text-primary bg-primary/5 cursor-pointer font-medium"
                >
                  <User className="mr-3 h-4 w-4" /> Detail Akun
                </Button>

                <Button
                  variant="ghost"
                  className="justify-start hover:bg-slate-50 cursor-pointer relative z-30 text-slate-600"
                  onClick={() => navigate("/alamat")}
                >
                  <MapPin className="mr-3 h-4 w-4" /> Daftar Alamat
                </Button>

                <Button
                  variant="ghost"
                  className="justify-start hover:bg-slate-50 cursor-pointer relative z-30 text-slate-600"
                  onClick={() => navigate("/pesanan")}
                >
                  <Package className="mr-3 h-4 w-4" /> Pesanan Saya
                </Button>

                <Separator className="my-2" />

                <Button
                  variant="ghost"
                  className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  <LogOut className="mr-3 h-4 w-4" /> Keluar Aplikasi
                </Button>
              </CardContent>
            </Card>

            {!phoneVerified && (
              <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-xs flex justify-between items-center">
                  <span>Verifikasi nomor HP untuk keamanan.</span>
                  <span
                    className="font-bold underline cursor-pointer"
                    onClick={() => setShowVerifyDialog(true)}
                  >
                    Verifikasi
                  </span>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Kolom Kanan: Konten Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Card Informasi Pribadi */}
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" /> Informasi Pribadi
                </CardTitle>
                {!isEditing ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="cursor-pointer relative z-30"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" /> Edit Profil
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditing(false)}
                    >
                      <X className="h-4 w-4" /> Batal
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveChanges}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" /> Simpan
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-600">Nama Lengkap</Label>
                    <Input
                      disabled={!isEditing}
                      value={profile.full_name}
                      onChange={(e) =>
                        setProfile({ ...profile, full_name: e.target.value })
                      }
                      className={`transition-colors ${
                        isEditing
                          ? "bg-white border-primary ring-1 ring-primary/20"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-600">Email</Label>
                    <Input
                      disabled
                      value={profile.email}
                      className="bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-slate-600">Nomor Telepon</Label>
                    <div className="flex gap-3">
                      <Input
                        disabled={!isEditing}
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                        className={`transition-colors ${
                          isEditing
                            ? "bg-white border-primary ring-1 ring-primary/20"
                            : "bg-slate-50 border-slate-200"
                        }`}
                        placeholder="08..."
                      />
                      {/* BUTTON VERIFIKASI (MUNCUL JIKA TIDAK EDITING & BELUM VERIF) */}
                      {!isEditing && !phoneVerified && (
                        <Button
                          variant="outline"
                          className="text-amber-600 border-amber-200 hover:bg-amber-50"
                          onClick={() => {
                            setInputPhone(profile.phone);
                            setShowVerifyDialog(true);
                          }}
                        >
                          Verifikasi
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card Alamat Utama */}
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary" /> Alamat Utama
                </CardTitle>
                <Button
                  variant="link"
                  size="sm"
                  className="cursor-pointer relative z-30"
                  onClick={() => navigate("/alamat")}
                >
                  {defaultAddress ? "Ubah Alamat" : "Tambah Alamat"}
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                {defaultAddress ? (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-4">
                    <div className="bg-white p-2 rounded-full shadow-sm mt-1">
                      <Home className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {defaultAddress.label}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] border-green-500 text-green-600 bg-green-50"
                        >
                          Utama
                        </Badge>
                      </div>
                      <p className="font-medium text-sm text-slate-700">
                        {defaultAddress.recipient_name}{" "}
                        <span className="text-slate-400 font-normal">
                          | {defaultAddress.phone_number}
                        </span>
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {defaultAddress.address_line}, {defaultAddress.city},{" "}
                        {defaultAddress.province}, {defaultAddress.postal_code}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                      <MapPin className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      Belum ada alamat utama
                    </p>
                    <p className="text-xs text-slate-500 mb-4 max-w-xs">
                      Tambahkan alamat untuk mempercepat proses checkout pesanan
                      Anda.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer relative z-30"
                      onClick={() => navigate("/alamat")}
                    >
                      Atur Alamat
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* === DIALOG VERIFIKASI (POPUP) === */}
        <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl">
                Verifikasi Nomor HP
              </DialogTitle>
              <DialogDescription className="text-center">
                Pastikan nomor WhatsApp Anda aktif untuk menerima kode OTP.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 space-y-4">
              {verifyStep === "INPUT_PHONE" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nomor WhatsApp</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="08123456789"
                        className="pl-9"
                        value={inputPhone}
                        onChange={(e) => setInputPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleSendOtp}
                    disabled={verifyLoading}
                  >
                    {verifyLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Kirim Kode OTP
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
                    <p className="text-sm text-muted-foreground">Kode Demo:</p>
                    <p className="text-2xl font-bold tracking-widest text-primary">
                      123456
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Masukkan Kode OTP</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="6 Digit Kode"
                        className="pl-9 text-center font-mono text-lg"
                        maxLength={6}
                        value={inputOtp}
                        onChange={(e) => setInputOtp(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleVerifyOtp}
                    disabled={verifyLoading}
                  >
                    {verifyLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Verifikasi OTP
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-xs text-muted-foreground"
                    onClick={() => setVerifyStep("INPUT_PHONE")}
                  >
                    Ganti Nomor
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ProfilePage;
