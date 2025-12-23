import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pill, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Cek Email & Password (Authentication)
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User tidak ditemukan.");

      // 2. Cek Role Admin di Database (Authorization)
      // Kita query ke tabel 'user_roles' untuk melihat apakah user ini punya role 'admin'
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authData.user.id)
        .single(); // Ambil satu baris saja

      // Jika terjadi error saat ambil role, atau role bukan 'admin'
      if (roleError || roleData?.role !== "admin") {
        // Logout paksa karena dia bukan admin
        await supabase.auth.signOut();
        throw new Error("Akses Ditolak: Akun Anda bukan akun Administrator.");
      }

      // 3. Jika Lolos Kedua Cek di Atas
      localStorage.setItem("adminAuth", "true");
      toast.success("Login Admin Berhasil!");
      navigate("/admin");
    } catch (error: any) {
      console.error("Login Error:", error);

      // Pesan error khusus jika user biasa mencoba masuk
      if (error.message.includes("Akses Ditolak")) {
        toast.error("AKSES DITOLAK: Anda bukan Admin!", {
          icon: <ShieldAlert className="w-5 h-5 text-red-600" />,
          duration: 4000,
        });
      } else {
        toast.error(error.message || "Email atau password salah");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-slate-800 bg-slate-950/50 backdrop-blur-xl text-slate-100 z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
            <Pill className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
            <CardDescription className="text-slate-400">
              Khusus Pegawai & Administrator
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email Admin
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@medicgo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 pr-10 focus:border-blue-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-slate-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 font-semibold h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memeriksa
                  Akses...
                </>
              ) : (
                "Masuk Dashboard"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
