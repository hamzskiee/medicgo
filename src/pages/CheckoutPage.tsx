import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MapPin,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Phone,
  ShieldCheck,
  Home,
  Building2,
  Loader2,
  Copy,
  Banknote,
  Wallet,
  QrCode,
  Smartphone,
  KeyRound,
  ArrowLeft, // <--- 1. Import Icon Panah
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const COD_LIMIT = 100000;

interface AddressData {
  id: string;
  label: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
  recipient_name: string;
  phone_number: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    items: cartItems,
    totalPrice: cartTotalPrice,
    deliveryFee,
    clearCart,
  } = useCart();
  const { user, isAuthenticated } = useAuth();

  // --- LOGIKA DATA CHECKOUT (RESEP vs KERANJANG) ---
  const directData = location.state;
  const isDirectPurchase = !!directData?.directPurchase;

  // Jika Direct Purchase, gunakan items dari navigate state. Jika tidak, gunakan Cart.
  const items = isDirectPurchase ? directData.items : cartItems;
  const currentTotalPrice = isDirectPurchase
    ? directData.totalAmount
    : cartTotalPrice;

  // Hitung Grand Total
  const grandTotal = currentTotalPrice + deliveryFee;
  const isCODAvailable = grandTotal < COD_LIMIT;

  // --- STATE UI ---
  const [savedAddresses, setSavedAddresses] = useState<AddressData[]>([]);
  const [selectedAddressType, setSelectedAddressType] =
    useState<string>("Rumah");

  const [address, setAddress] = useState({
    fullAddress: "",
    district: "",
    city: "",
    postalCode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // --- STATE UNTUK VERIFIKASI NO HP ---
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifyStep, setVerifyStep] = useState<"INPUT_PHONE" | "INPUT_OTP">(
    "INPUT_PHONE"
  );
  const [inputPhone, setInputPhone] = useState("");
  const [inputOtp, setInputOtp] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  const [isLocallyVerified, setIsLocallyVerified] = useState(false);

  // LOGIC VERIFIKASI
  const isPhoneVerified =
    (user as any)?.user_metadata?.phone_verified === true ||
    localStorage.getItem("phoneVerified") === "true" ||
    isLocallyVerified;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id);

      if (data && !error) {
        setSavedAddresses(data as any);
        const rumah = data.find((a: any) => a.label === "Rumah");
        if (rumah) {
          fillForm(rumah);
          setSelectedAddressType("Rumah");
        }
      }
    };
    fetchAddresses();
  }, [user]);

  const fillForm = (data: any) => {
    setAddress({
      fullAddress: data.address_line || "",
      district: data.province || "",
      city: data.city || "",
      postalCode: data.postal_code || "",
    });
  };

  const handleAddressTypeClick = (type: string) => {
    setSelectedAddressType(type);
    const found = savedAddresses.find((a) => a.label === type);
    if (found) {
      fillForm(found);
      toast({ title: `Alamat ${type} digunakan` });
    } else {
      toast({
        title: `Alamat ${type} kosong`,
        description: "Silakan isi manual.",
      });
      setAddress({ fullAddress: "", district: "", city: "", postalCode: "" });
    }
  };

  // --- LOGIC VERIFIKASI HP DEMO ---
  const handleSendOtp = () => {
    if (!inputPhone || inputPhone.length < 10) {
      toast({ title: "Nomor tidak valid", variant: "destructive" });
      return;
    }
    setVerifyLoading(true);
    setTimeout(() => {
      setVerifyLoading(false);
      setVerifyStep("INPUT_OTP");
      toast({
        title: "OTP Terkirim",
        description: "Gunakan kode: 123456 (Demo)",
      });
    }, 1500);
  };

  const handleVerifyOtp = () => {
    setVerifyLoading(true);
    setTimeout(() => {
      if (inputOtp === "123456") {
        localStorage.setItem("phoneVerified", "true");
        setIsLocallyVerified(true);
        setVerifyLoading(false);
        setShowVerifyDialog(false);
        toast({
          title: "Verifikasi Berhasil!",
          description: "Silakan lanjutkan pembayaran.",
        });
      } else {
        setVerifyLoading(false);
        toast({ title: "Kode OTP Salah", variant: "destructive" });
      }
    }, 1500);
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({ title: "Login Diperlukan", variant: "destructive" });
      navigate("/auth");
      return;
    }
    if (!isPhoneVerified) {
      toast({
        title: "Verifikasi Diperlukan",
        description:
          "Demi keamanan, mohon verifikasi nomor HP Anda sebelum checkout.",
        variant: "destructive",
      });
      setShowVerifyDialog(true);
      return;
    }
    setShowConfirmDialog(true);
  };

  // --- FUNGSI PEMBAYARAN FINAL ---
  const handleConfirmPayment = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const fullShippingAddress = `${selectedAddressType} - ${address.fullAddress}, Kec. ${address.district}, ${address.city}, ${address.postalCode}`;

      // --- SKENARIO 1: BAYAR RESEP (UPDATE TABEL RESEP) ---
      if (isDirectPurchase && directData?.orderId) {
        const { error: updateError } = await supabase
          .from("prescriptions")
          .update({
            status: "paid",
            payment_method: paymentMethod,
            shipping_address: fullShippingAddress, // Data Alamat disimpan disini
          })
          .eq("id", directData.orderId);

        if (updateError) throw updateError;

        toast({ title: "Pembayaran Resep Berhasil!" });
        navigate("/pesanan");
      }

      // --- SKENARIO 2: BELANJA KERANJANG (INSERT ORDER BARU) ---
      else {
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: user.id,
            total_amount: grandTotal,
            status: "pending",
            shipping_address: fullShippingAddress,
            payment_method: paymentMethod,
          })
          .select()
          .single();

        if (orderError) throw orderError;

        const orderItems = items.map((item: any) => ({
          order_id: orderData.id,
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) throw itemsError;

        // UPDATE STOCK & SOLD COUNT KE TABEL PRODUCTS
        for (const item of items) {
          const { data: productNow } = await supabase
            .from("products")
            .select("stock, sold")
            .eq("id", item.product.id)
            .single();

          if (productNow) {
            const newStock = productNow.stock - item.quantity;
            const newSold = (productNow.sold || 0) + item.quantity;

            await supabase
              .from("products")
              .update({
                stock: newStock < 0 ? 0 : newStock,
                sold: newSold,
              })
              .eq("id", item.product.id);
          }
        }

        clearCart();
        toast({
          title: "Pesanan Berhasil Dibuat!",
          description: "Mohon tunggu verifikasi admin.",
        });
        navigate(`/lacak-pesanan?id=${orderData.id}`);
      }

      setShowConfirmDialog(false);
    } catch (error: any) {
      setShowConfirmDialog(false);
      toast({
        title: "Gagal Membuat Pesanan",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Disalin!", description: text });
  };

  if (items.length === 0) {
    // Tampilan jika tidak ada item (Direct Access ke URL Checkout)
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-bold mb-4">Keranjang Kosong</h2>
          <p className="text-slate-500 mb-6">
            Silakan pilih produk atau tebus resep terlebih dahulu.
          </p>
          <Button onClick={() => navigate("/obat")}>Belanja Obat</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* --- 2. TOMBOL KEMBALI DI SINI --- */}
        <div className="mb-4">
          <Button
            variant="ghost"
            className="pl-0 text-slate-500 hover:text-slate-900 hover:bg-transparent gap-2"
            onClick={() => navigate(-1)} // Kembali ke halaman sebelumnya
          >
            <ArrowLeft className="w-5 h-5" /> Kembali
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-8">
          {isDirectPurchase ? "Checkout Resep" : "Checkout"}
        </h1>

        {isAuthenticated && !isPhoneVerified && (
          <Alert
            variant="destructive"
            className="mb-6 border-red-200 bg-red-50"
          >
            <Phone className="h-4 w-4 text-red-600" />
            <AlertDescription className="flex justify-between items-center text-red-800">
              <span>
                Nomor telepon belum diverifikasi. Pesanan tidak dapat diproses.
              </span>
              <Button
                variant="outline"
                size="sm"
                className="bg-white border-red-200 text-red-700 hover:bg-red-100"
                onClick={() => setShowVerifyDialog(true)}
              >
                Verifikasi Sekarang
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handlePreSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card p-6 rounded-xl border">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" /> Alamat
                    Pengiriman
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={
                        selectedAddressType === "Rumah" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleAddressTypeClick("Rumah")}
                      className="gap-2 h-8"
                    >
                      <Home className="h-3.5 w-3.5" /> Rumah
                    </Button>
                    <Button
                      type="button"
                      variant={
                        selectedAddressType === "Kantor" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleAddressTypeClick("Kantor")}
                      className="gap-2 h-8"
                    >
                      <Building2 className="h-3.5 w-3.5" /> Kantor
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label>Alamat Lengkap</Label>
                    <Input
                      placeholder="Jl. Raya No. 123"
                      value={address.fullAddress}
                      onChange={(e) =>
                        setAddress({ ...address, fullAddress: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Kecamatan / Provinsi</Label>
                      <Input
                        placeholder="Contoh: Jawa Barat"
                        value={address.district}
                        onChange={(e) =>
                          setAddress({ ...address, district: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>Kota</Label>
                      <Input
                        placeholder="Contoh: Bogor"
                        value={address.city}
                        onChange={(e) =>
                          setAddress({ ...address, city: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="w-1/2">
                    <Label>Kode Pos</Label>
                    <Input
                      placeholder="16610"
                      value={address.postalCode}
                      onChange={(e) =>
                        setAddress({ ...address, postalCode: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              {/* CARD METODE PEMBAYARAN */}
              <div className="bg-card p-6 rounded-xl border">
                <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-primary" /> Metode
                  Pembayaran
                </h2>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  {/* COD */}
                  <div
                    className={`flex items-center space-x-3 border rounded-lg p-4 transition-all ${
                      !isCODAvailable
                        ? "opacity-50 bg-muted cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <RadioGroupItem
                      value="cod"
                      id="cod"
                      disabled={!isCODAvailable}
                    />
                    <Label
                      htmlFor="cod"
                      className={`flex-1 ${
                        !isCODAvailable
                          ? "cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>Bayar di Tempat (COD)</span>
                        {isCODAvailable && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> Tersedia
                          </span>
                        )}
                      </div>
                    </Label>
                  </div>
                  {!isCODAvailable && (
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-700 text-sm">
                        COD maksimal Rp 100rb.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Transfer */}
                  <div className="flex items-center space-x-3 border rounded-lg p-4">
                    <RadioGroupItem value="transfer" id="transfer" />
                    <Label htmlFor="transfer" className="cursor-pointer flex-1">
                      Transfer Bank (BCA / Mandiri / BRI)
                    </Label>
                  </div>

                  {/* E-Wallet */}
                  <div className="flex items-center space-x-3 border rounded-lg p-4">
                    <RadioGroupItem value="ewallet" id="ewallet" />
                    <Label htmlFor="ewallet" className="cursor-pointer flex-1">
                      E-Wallet (GoPay / OVO / DANA)
                    </Label>
                  </div>

                  {/* QRIS */}
                  <div className="flex items-center space-x-3 border rounded-lg p-4">
                    <RadioGroupItem value="qris" id="qris" />
                    <Label
                      htmlFor="qris"
                      className="cursor-pointer flex-1 flex items-center justify-between"
                    >
                      <span>QRIS (Semua Pembayaran)</span>
                      <QrCode className="h-4 w-4 text-slate-500" />
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="bg-card p-6 rounded-xl border h-fit sticky top-24">
              <h3 className="font-semibold text-lg mb-4">Ringkasan Pesanan</h3>
              <div className="space-y-3 mb-4">
                {items.map((item: any) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {item.product.name} x{item.quantity}
                    </span>
                    <span>
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(currentTotalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ongkos Kirim</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between font-semibold text-lg mb-6">
                <span>Total</span>
                <span className="text-primary">{formatPrice(grandTotal)}</span>
              </div>
              <Button
                type="submit"
                className="w-full gap-2"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
                {loading ? "Memproses..." : "Bayar Sekarang"}
              </Button>
            </div>
          </div>
        </form>

        {/* --- DIALOG VERIFIKASI NO HP --- */}
        <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl">
                Verifikasi Nomor HP
              </DialogTitle>
              <DialogDescription className="text-center">
                Untuk keamanan pesanan, mohon verifikasi nomor Anda.
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

        {/* --- DIALOG KONFIRMASI PEMBAYARAN --- */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl">
                Instruksi Pembayaran
              </DialogTitle>
              <DialogDescription className="text-center">
                Selesaikan pembayaran sebelum pesanan diproses.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  Total Tagihan
                </p>
                <h2 className="text-3xl font-bold text-primary">
                  {formatPrice(grandTotal)}
                </h2>
              </div>

              <Separator />

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-4">
                {/* CASE: Transfer */}
                {paymentMethod === "transfer" && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <Banknote className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Bank BCA</p>
                        <p className="text-xs text-muted-foreground">
                          Otomatis dicek
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Nomor Rekening
                      </p>
                      <div className="flex items-center justify-between bg-white border rounded-md p-2">
                        <span className="font-mono font-bold text-lg">
                          123 456 7890
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyToClipboard("1234567890")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        a.n PT MedicGo Indonesia
                      </p>
                    </div>
                  </>
                )}

                {/* CASE: E-Wallet */}
                {paymentMethod === "ewallet" && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg text-green-600">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          E-Wallet (GoPay/OVO/DANA)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Transfer ke nomor di bawah
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Nomor E-Wallet
                      </p>
                      <div className="flex items-center justify-between bg-white border rounded-md p-2">
                        <span className="font-mono font-bold text-lg">
                          0812 3456 7890
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyToClipboard("081234567890")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        a.n MedicGo Official
                      </p>
                    </div>
                  </>
                )}

                {/* CASE: QRIS */}
                {paymentMethod === "qris" && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                      {/* Placeholder QR Code */}
                      <div className="w-48 h-48 bg-slate-900 flex items-center justify-center rounded text-white">
                        <QrCode className="w-24 h-24" />
                      </div>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-bold text-slate-900">
                        Scan QR Code di atas
                      </p>
                      <p className="text-xs text-slate-500">
                        Mendukung GoPay, OVO, DANA, ShopeePay, BCA Mobile, dll.
                      </p>
                    </div>
                  </div>
                )}

                {/* CASE: COD */}
                {paymentMethod === "cod" && (
                  <div className="text-center py-2">
                    <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-2 opacity-20" />
                    <p className="font-medium text-slate-900">
                      Bayar di Tempat
                    </p>
                    <p className="text-sm text-slate-500">
                      Siapkan uang pas saat kurir datang.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-col gap-2">
              <Button
                className="w-full h-11 text-base"
                onClick={handleConfirmPayment}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {paymentMethod === "cod"
                  ? "Konfirmasi Pesanan"
                  : "Ya, Saya Sudah Bayar"}
              </Button>
              <Button
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowConfirmDialog(false)}
                disabled={loading}
              >
                Batalkan Pesanan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
