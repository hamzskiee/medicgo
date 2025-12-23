import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
// Pastikan path ini sesuai dengan lokasi logo Anda
import medicGoLogo from "@/assets/medicgo-logo.png";

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, verifyEmail, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  // State View
  const [view, setView] = useState<"auth" | "forgot-password" | "verify-otp">(
    "auth"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Data Form
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [resetEmail, setResetEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  React.useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  // --- HANDLERS ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(loginData.email, loginData.password);
    setLoading(false);
    if (success) navigate("/");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Password tidak cocok!");
      return;
    }
    setLoading(true);
    const success = await register(
      registerData.name,
      registerData.email,
      registerData.password
    );
    setLoading(false);
    if (success) {
      toast.success("Silakan cek email untuk kode verifikasi.");
      setView("verify-otp");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await verifyEmail(registerData.email, otpCode);
    setLoading(false);
    if (success) navigate("/");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });
      if (error) throw error;
      toast.success("Link reset terkirim ke email!");
      setView("auth");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2">
      {/* === BAGIAN KIRI: VISUAL & BRANDING (Hidden di Mobile) === */}
      <div className="hidden lg:flex relative flex-col justify-between bg-zinc-900 text-white p-10 overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://i.pinimg.com/736x/1d/ef/29/1def2917f52ef20290fec20414d2e53e.jpg"
            alt="Medical Background"
            className="w-full h-full object-cover opacity-70 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
        </div>

        {/* Brand Logo - Desktop (Ukuran Besar) */}
        <div className="relative z-10 flex items-center">
          <div className="h-40 w-auto">
            <img
              src={medicGoLogo}
              alt="MedicGo Logo"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Testimonial / Value Prop */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium leading-relaxed">
              &ldquo;Platform kesehatan paling lengkap yang pernah saya gunakan.
              Pesan obat, konsultasi, dan resep dokter jadi sangat mudah.&rdquo;
            </p>
            <footer className="text-sm text-zinc-400">
              dr. Karina Ilham, Sp.PD
            </footer>
          </blockquote>

          <div className="flex gap-4 pt-4">
            <div className="flex items-center gap-2 text-xs text-zinc-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="w-3 h-3 text-green-400" /> Data
              Terenkripsi
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
              <Stethoscope className="w-3 h-3 text-blue-400" /> Dokter
              Terverifikasi
            </div>
          </div>
        </div>
      </div>

      {/* === BAGIAN KANAN: FORM === */}
      {/* Added 'relative' class here to position the back button */}
      <div className="relative flex items-center justify-center p-6 sm:p-12 bg-background lg:bg-transparent">
        {/* --- TOMBOL KEMBALI (Added) --- */}
        <Button
          variant="ghost"
          className="absolute top-4 left-4 md:top-8 md:left-8 text-muted-foreground hover:text-primary transition-colors"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>
        {/* ------------------------------- */}

        <div className="mx-auto w-full max-w-[400px] space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
          {/* HEADER SECTION (Logo & Teks digabung agar rapat) */}
          <div className="flex flex-col items-center text-center">
            {/* Logo di atas Form (Ukuran h-32 = Besar) */}
            <div className="h-32 w-auto mb-1">
              <img
                src={medicGoLogo}
                alt="MedicGo Logo"
                className="h-full w-full object-contain"
              />
            </div>

            {/* Judul Halaman */}
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {view === "auth"
                ? "Akses Akun Anda"
                : view === "verify-otp"
                ? "Verifikasi Email"
                : "Reset Password"}
            </h1>

            {/* Subtitle */}
            <p className="text-sm text-muted-foreground mt-2">
              {view === "auth"
                ? "Masukkan detail akun Anda untuk melakukan pemesanan."
                : view === "verify-otp"
                ? `Kami telah mengirim kode ke ${registerData.email}`
                : "Masukkan email untuk menerima instruksi reset."}
            </p>
          </div>

          {/* VIEW: AUTH (Login & Register) */}
          {view === "auth" && (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 h-12 p-1 bg-muted/50 rounded-xl">
                <TabsTrigger
                  value="login"
                  className="rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Masuk
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Daftar
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="login"
                className="space-y-4 animate-in zoom-in-95 duration-300"
              >
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        type="email"
                        placeholder="nama@email.com"
                        className="pl-10 h-11"
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Password</Label>
                      <button
                        type="button"
                        onClick={() => setView("forgot-password")}
                        className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        Lupa Password?
                      </button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan password Anda"
                        className="pl-10 pr-10 h-11"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 font-medium shadow-lg shadow-primary/20"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Masuk Sekarang"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent
                value="register"
                className="space-y-4 animate-in zoom-in-95 duration-300"
              >
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nama Lengkap</Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        placeholder="Nama Anda"
                        className="pl-10 h-11"
                        value={registerData.name}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        type="email"
                        placeholder="nama@email.com"
                        className="pl-10 h-11"
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <div className="relative group">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Min. 6"
                          className="h-11"
                          value={registerData.password}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              password: e.target.value,
                            })
                          }
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Ulangi Password</Label>
                      <div className="relative group">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Konfirmasi"
                          className="h-11"
                          value={registerData.confirmPassword}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              confirmPassword: e.target.value,
                            })
                          }
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="show-pass"
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                      checked={showPassword}
                      onChange={() => setShowPassword(!showPassword)}
                    />
                    <label
                      htmlFor="show-pass"
                      className="text-xs text-muted-foreground cursor-pointer"
                    >
                      Lihat Password
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 font-medium shadow-lg shadow-primary/20"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Buat Akun Baru"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}

          {/* VIEW: VERIFY OTP */}
          {view === "verify-otp" && (
            <div className="space-y-6">
              <div className="bg-primary/5 p-6 rounded-2xl text-center border border-primary/10">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-foreground font-semibold">
                  Cek Inbox Anda
                </h3>
                <p className="text-xs text-muted-foreground mt-1 px-4">
                  Kami telah mengirimkan kode verifikasi 8 digit ke email Anda.
                  Masukkan kode di bawah ini.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label className="sr-only">Kode OTP</Label>
                  <Input
                    placeholder="0  0  0  0  0  0"
                    className="text-center text-2xl tracking-[0.5em] font-mono h-14 font-bold"
                    maxLength={10}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 shadow-lg shadow-primary/20"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Verifikasi & Masuk"
                  )}
                </Button>
              </form>

              <Button
                variant="ghost"
                className="w-full h-11 text-muted-foreground hover:text-foreground"
                onClick={() => setView("auth")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali / Ganti Email
              </Button>
            </div>
          )}

          {/* VIEW: FORGOT PASSWORD */}
          {view === "forgot-password" && (
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground">
                Jangan khawatir. Masukkan email yang terdaftar dan kami akan
                mengirimkan tautan untuk mereset password Anda.
              </div>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email Terdaftar</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      type="email"
                      className="pl-10 h-11"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      placeholder="nama@email.com"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 shadow-lg shadow-primary/20"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Kirim Link Reset"
                  )}
                </Button>
              </form>
              <Button
                variant="ghost"
                className="w-full h-11 text-muted-foreground hover:text-foreground"
                onClick={() => setView("auth")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Login
              </Button>
            </div>
          )}

          {/* Footer Terms */}
          <p className="px-8 text-center text-xs text-muted-foreground">
            Dengan melanjutkan, Anda menyetujui{" "}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-primary"
            >
              Syarat Layanan
            </a>{" "}
            dan{" "}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-primary"
            >
              Kebijakan Privasi
            </a>{" "}
            kami.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
