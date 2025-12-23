import React from "react";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Ilham Rizki",
    location: "Ciapus",
    rating: 5,
    text: "Pengiriman sangat cepat! Obat sampai dalam 30 menit. Sangat membantu saya sakit pada malam hari.",
    avatar: "IR",
  },
  {
    name: "Aqshal",
    location: "Cibinong",
    rating: 5,
    text: "Harga kompetitif dan produk selalu asli. Sudah berlangganan vitamin bulanan di MedicGo.",
    avatar: "AQ",
  },
  {
    name: "Azwariza",
    location: "Yasmin",
    rating: 5,
    text: "Fitur upload resep sangat praktis. Apoteker langsung menghubungi untuk konfirmasi. Pelayanan profesional!",
    avatar: "AZ",
  },
  {
    name: "Alif Wisnu",
    location: "Cilebut",
    rating: 5,
    text: "Aku dan my kisah pergi ke MedicGo untuk mendapatkan obat resep dengan mudah. Prosesnya cepat dan apoteker sangat ramah.",
    avatar: "AW",
  },
  {
    name: "Fazel Raihan ",
    location: "Dramaga",
    rating: 5,
    text: "Aku mendapatkan My kisah dengan Mba Mba Apoteker yang ramah dan membantu banget. Terima kasih MedicGo!",
    avatar: "FR",
  },
  {
    name: "Ali Yatsir ",
    location: "Pakuan",
    rating: 5,
    text: "Sangat membantu saya dalam memenuhi kebutuhan obat-obatan dengan cepat dan mudah tanpa harus keluar rumah.",
    avatar: "AY",
  },
];

// --- KONFIGURASI ANIMASI ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 20 },
  },
};

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header Animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Apa Kata Pelanggan
          </h2>
          <p className="text-muted-foreground">
            Ribuan pelanggan puas dengan layanan MedicGo
          </p>
        </motion.div>

        {/* Grid Animation */}
        <motion.div
          // SOLUSI ERROR: Tambahkan 'as any' agar TypeScript tidak error
          variants={containerVariants as any}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              // SOLUSI ERROR: Tambahkan 'as any' di sini juga
              variants={cardVariants as any}
              whileHover={{ y: -5 }}
              // UPDATE SHADOW: shadow-blue-500/10 (Bayangan Biru Halus)
              className="bg-background rounded-2xl p-6 shadow-xl shadow-blue-500/10 border border-blue-100/50 relative"
            >
              {/* Quote icon */}
              <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/10" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-orange text-orange" />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground mb-6 leading-relaxed">
                {testimonial.text}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
