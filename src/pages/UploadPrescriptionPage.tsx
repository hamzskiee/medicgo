import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileImage,
  X,
  CheckCircle,
  Camera,
  ShieldCheck,
  Truck,
  AlertCircle,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase"; // Import Supabase

const UploadPrescriptionPage: React.FC = () => {
  const navigate = useNavigate();
  // Ambil user object juga untuk mendapatkan user.id
  const { isAuthenticated, user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Drag Events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
    } else {
      toast({
        title: "Format Salah",
        description: "Mohon upload file gambar (JPG/PNG).",
        variant: "destructive",
      });
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // --- LOGIC UTAMA: UPLOAD KE SUPABASE ---
  const handleSubmit = async () => {
    // 1. Cek Login
    if (!isAuthenticated || !user) {
      navigate("/auth", { state: { from: "/upload-resep" } });
      return;
    }
    if (!file) return;

    try {
      setUploading(true);

      // 2. Upload Gambar ke Storage Supabase
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = fileName; // Path sederhana

      const { error: uploadError } = await supabase.storage
        .from("prescription-images") // Pastikan bucket ini sudah dibuat lewat SQL
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Dapatkan URL Gambar Publik
      const {
        data: { publicUrl },
      } = supabase.storage.from("prescription-images").getPublicUrl(filePath);

      // 4. Masukkan Data ke Tabel Database
      const { error: dbError } = await supabase.from("prescriptions").insert({
        user_id: user.id,
        image_url: publicUrl,
        status: "pending",
        notes: "Resep diupload via web",
      });

      if (dbError) throw dbError;

      // 5. Sukses
      toast({
        title: "Resep Berhasil Dikirim!",
        description:
          "Apoteker kami sedang memverifikasi resep Anda. Cek status di Pesanan Saya.",
      });

      setFile(null);
      setPreview(null);

      // Redirect ke halaman pesanan setelah 2 detik
      setTimeout(() => {
        navigate("/pesanan");
      }, 2000);
    } catch (error: any) {
      console.error("Gagal upload:", error);
      toast({
        title: "Gagal Mengirim Resep",
        description: error.message || "Terjadi kesalahan sistem.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const steps = [
    {
      icon: Camera,
      title: "1. Foto Resep",
      desc: "Pastikan tulisan dokter terbaca jelas & tidak buram",
      color: "text-blue-500 bg-blue-50",
    },
    {
      icon: ShieldCheck,
      title: "2. Verifikasi",
      desc: "Apoteker kami akan mengecek ketersediaan obat",
      color: "text-purple-500 bg-purple-50",
    },
    {
      icon: Truck,
      title: "3. Pengiriman",
      desc: "Lakukan pembayaran dan obat langsung dikirim",
      color: "text-green-500 bg-green-50",
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
        <div className="container mx-auto px-4 py-12">
          {/* Header Section */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Upload Resep Dokter
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
              Tebus obat resep tanpa antre. Cukup foto resep Anda, upload, dan
              tunggu obat diantar ke rumah.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-start">
            {/* Left Column: Upload Area */}
            <div className="lg:col-span-7 space-y-6">
              {/* --- UPDATE AREA DRAG & DROP --- */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "relative group bg-white rounded-3xl border-2 border-dashed transition-all duration-300 ease-out overflow-hidden shadow-sm min-h-[400px] flex flex-col items-center justify-center",
                  isDragging
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-slate-200 hover:border-primary/50 hover:shadow-md",
                  preview ? "border-solid border-slate-200 p-0" : "p-12"
                )}
              >
                {preview ? (
                  <div className="relative w-full h-full min-h-[400px] bg-slate-900 flex items-center justify-center">
                    <img
                      src={preview}
                      alt="Preview Resep"
                      className="max-w-full max-h-[500px] object-contain"
                    />
                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-10 w-10 rounded-full shadow-lg hover:bg-white text-slate-700"
                        onClick={() => {
                          setFile(null);
                          setPreview(null);
                        }}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white z-20">
                      <p className="font-medium truncate">{file?.name}</p>
                      <p className="text-sm opacity-80">
                        {(file!.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center relative z-20">
                    <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      Drag & Drop foto di sini
                    </h3>
                    <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                      Atau klik tombol di bawah untuk memilih file dari
                      perangkat Anda
                    </p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />

                    <Button
                      size="lg"
                      onClick={triggerFileSelect}
                      className="rounded-full px-8 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                    >
                      <FileImage className="h-5 w-5 mr-2" />
                      Pilih Foto Resep
                    </Button>
                  </div>
                )}
              </div>

              <Button
                className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1"
                size="lg"
                onClick={handleSubmit}
                disabled={!file || uploading}
              >
                {uploading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span> Mengupload...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" /> Kirim Resep
                    Sekarang
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 bg-slate-50 py-3 rounded-lg border border-slate-100">
                <AlertCircle className="h-4 w-4" />
                Data resep Anda dienkripsi dan aman.
              </div>
            </div>

            {/* Right Column: Instructions & Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  Cara Kerja
                </h3>

                <div className="space-y-8 relative">
                  <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-100" />
                  {steps.map((step, idx) => (
                    <div key={idx} className="relative flex gap-4">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 relative z-10 border-4 border-white shadow-sm",
                          step.color
                        )}
                      >
                        <step.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg mb-1">
                          {step.title}
                        </h4>
                        <p className="text-slate-500 text-sm leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-gradient-to-br from-primary to-blue-600 rounded-3xl p-8 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -ml-10 -mb-10" />

                <h4 className="font-bold text-xl mb-2 relative z-10">
                  Butuh Bantuan?
                </h4>
                <p className="text-blue-100 mb-6 text-sm relative z-10">
                  Jika Anda kesulitan membaca resep atau butuh konsultasi obat,
                  apoteker kami siap membantu via WhatsApp.
                </p>

                <Button
                  className="w-full rounded-xl font-bold bg-white text-primary hover:bg-white/90 active:bg-blue-700 active:text-white transition-colors relative z-10 shadow-md"
                  onClick={() =>
                    window.open("https://wa.me/+6285215932326", "_blank")
                  }
                >
                  Chat Apoteker
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UploadPrescriptionPage;
