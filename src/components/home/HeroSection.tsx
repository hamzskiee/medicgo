import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Upload,
  Truck,
  Shield,
  Clock,
  Pill,
  Stethoscope,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

// --- DATA SLIDE ---
const heroSlides = [
  {
    image:
      "https://i.pinimg.com/736x/ca/9e/b2/ca9eb26d9b8abd36169e8b3e092b030b.jpg",
    title: "Stok Obat Terlengkap",
    subtitle: "Ribuan produk kesehatan tersedia",
  },
  {
    image:
      "https://i.pinimg.com/736x/dd/32/42/dd3242f752532dc893c3ad89ae57498a.jpg",
    title: "Pengiriman Instan",
    subtitle: "Sampai dalam 30 - 60 menit",
  },
  {
    image:
      "https://i.pinimg.com/736x/3d/82/6f/3d826f07db448a3226264dce60dcf307.jpg",
    title: "Layanan 24 Jam",
    subtitle: "Selalu siap sedia untuk Anda",
  },
];

const floatingBadges = [
  {
    icon: Shield,
    title: "100% Asli",
    subtitle: "Produk Terjamin",
    color: "secondary",
  },
  {
    icon: Truck,
    title: "Pengiriman Cepat",
    subtitle: "30-60 menit",
    color: "primary",
  },
  {
    icon: Clock,
    title: "Respon 24 Jam",
    subtitle: "Selalu siap sedia",
    color: "primary",
  },
];

// --- KATA KUNCI UNTUK PLACEHOLDER BERGERAK ---
const searchKeywords = [
  "Cari obat sakit kepala...",
  "Cari vitamin C...",
  "Cari obat maag...",
  "Cari termometer...",
  "Cari obat flu & batuk...",
  "Cari masker medis...",
];

export const HeroSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // --- STATE UNTUK TYPEWRITER EFFECT ---
  const [placeholder, setPlaceholder] = useState("");
  const [loopNum, setLoopNum] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/produk?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // --- EFEK SLIDER GAMBAR ---
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // --- EFEK TYPEWRITER PLACEHOLDER ---
  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % searchKeywords.length;
      const fullText = searchKeywords[i];

      setPlaceholder(
        isDeleting
          ? fullText.substring(0, placeholder.length - 1)
          : fullText.substring(0, placeholder.length + 1)
      );

      // Kecepatan Mengetik vs Menghapus
      setTypingSpeed(isDeleting ? 50 : 100);

      if (!isDeleting && placeholder === fullText) {
        // Selesai ngetik, tunggu sebentar sebelum hapus
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && placeholder === "") {
        // Selesai hapus, ganti kata berikutnya
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [placeholder, isDeleting, loopNum, typingSpeed]);

  const trustBadges = [
    { icon: Truck, label: "Antar 24 Jam" },
    { icon: Shield, label: "Apoteker Tersertifikasi" },
    { icon: Clock, label: "Respon Cepat" },
  ];

  const currentBadge = floatingBadges[currentIndex];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-medical-blue-light to-mint-light pb-12 lg:pb-48 pt-6 lg:pt-10">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          {/* --- LEFT CONTENT (TEXT) --- */}
          <div className="relative z-10 space-y-6 text-center lg:text-left order-last lg:order-first">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              Gratis Ongkir untuk Pembelian Pertama!
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight"
            >
              Obat & Vitamin{" "}
              <span className="text-gradient block lg:inline">
                Diantar ke Rumah
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-base lg:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0"
            >
              Apotek online terpercaya dengan ribuan produk kesehatan. Pesan
              mudah, bayar praktis, antar cepat 24 jam.
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              onSubmit={handleSearch}
              className="flex gap-2 max-w-md mx-auto lg:mx-0 w-full"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  // --- GUNAKAN STATE PLACEHOLDER ---
                  placeholder={placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-12 lg:h-14 rounded-xl lg:rounded-2xl text-base border-2 border-border focus:border-primary bg-background shadow-lg transition-all"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-12 lg:h-14 px-6 rounded-xl lg:rounded-2xl shadow-lg transition-transform active:scale-95"
              >
                Cari
              </Button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 rounded-xl h-12 transition-transform active:scale-95 w-full sm:w-auto"
                onClick={() => navigate("/upload-resep")}
              >
                <Upload className="h-5 w-5" />
                Upload Resep Dokter
              </Button>
            </motion.div>

            <div className="flex flex-wrap gap-2 lg:gap-4 justify-center lg:justify-start pt-4">
              {trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-background/80 backdrop-blur px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl shadow-sm border border-slate-100"
                >
                  <badge.icon className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                  <span className="text-xs lg:text-sm font-medium text-foreground">
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* --- RIGHT CONTENT (VISUAL - MOBILE OPTIMIZED) --- */}
          <div className="relative flex justify-center lg:justify-end pt-8 lg:pt-0">
            {/* Wrapper Perspective */}
            <div className="relative w-full max-w-sm lg:max-w-2xl perspective-1000">
              {/* Back Glow Layer */}
              <div className="absolute top-6 left-6 w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 rounded-[2rem] lg:rounded-[2.5rem] -z-10 blur-xl opacity-70"></div>

              {/* MAIN FRAME */}
              <div className="relative aspect-[4/3] rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] z-10 border-[4px] lg:border-[6px] border-white/80 backdrop-blur-sm">
                {heroSlides.map((slide, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-[1500ms] ease-linear ${
                      index === currentIndex
                        ? "opacity-100 z-10"
                        : "opacity-0 z-0"
                    }`}
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div
                      className={`absolute bottom-0 left-0 right-0 p-6 lg:p-10 text-white transition-all duration-1000 delay-300 ${
                        index === currentIndex
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-4"
                      }`}
                    >
                      <h3 className="text-xl lg:text-3xl font-bold mb-1 lg:mb-2 drop-shadow-md">
                        {slide.title}
                      </h3>
                      <p className="text-white/90 text-sm lg:text-lg font-medium drop-shadow-sm">
                        {slide.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* --- FLOATING ELEMENTS (HIDDEN ON MOBILE, VISIBLE ON LAPTOP) --- */}

              {/* 1. Badge Utama (Bawah Kiri) */}
              <div className="hidden md:block absolute -bottom-8 -left-2 md:-bottom-10 md:-left-8 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 z-30 min-w-[240px] border border-white/50 ring-1 ring-slate-100">
                <div className="relative h-12 overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={currentIndex}
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      exit={{ y: "-100%", opacity: 0 }}
                      transition={{
                        duration: 0.6,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="absolute inset-0 flex items-center gap-4"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl bg-${currentBadge.color}/10 flex items-center justify-center flex-shrink-0`}
                      >
                        <currentBadge.icon
                          className={`h-6 w-6 text-${
                            currentBadge.color === "secondary"
                              ? "secondary"
                              : "primary"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">
                          {currentBadge.title}
                        </p>
                        <p className="text-xs font-medium text-muted-foreground">
                          {currentBadge.subtitle}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* 2. Floating Icon: Pill (Kanan Atas) */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="hidden md:block absolute -top-6 -right-6 z-20"
              >
                <div className="bg-white p-4 rounded-2xl shadow-xl border border-white/50 backdrop-blur-sm">
                  <Pill className="h-8 w-8 text-secondary fill-secondary/20" />
                </div>
              </motion.div>

              {/* 3. Floating Icon: Stethoscope (Kiri Tengah) */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="hidden md:block absolute top-1/2 -left-10 z-20"
              >
                <div className="bg-white p-3 rounded-2xl shadow-xl border border-white/50 backdrop-blur-sm">
                  <Stethoscope className="h-6 w-6 text-primary" />
                </div>
              </motion.div>

              {/* 4. Floating Icon: Activity (Kanan Bawah) */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="hidden md:block absolute bottom-20 -right-8 z-0"
              >
                <div className="bg-white/80 p-3 rounded-full shadow-lg border border-white/40 backdrop-blur-sm">
                  <Activity className="h-5 w-5 text-emerald-500" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
