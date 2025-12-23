import React from "react";
import { Search, ShoppingCart, Truck } from "lucide-react";
import { motion, Variants } from "framer-motion";

const steps = [
  {
    icon: Search,
    title: "Cari Produk",
    description: "Cari obat, vitamin, atau alat kesehatan yang Anda butuhkan",
    color: "bg-blue-500",
    shadow: "shadow-blue-500/30",
  },
  {
    icon: ShoppingCart,
    title: "Masukkan Keranjang",
    description: "Pilih produk dan tambahkan ke keranjang belanja",
    color: "bg-emerald-500",
    shadow: "shadow-emerald-500/30",
  },
  {
    icon: Truck,
    title: "Diantar ke Rumah",
    description: "Pesanan dikirim langsung ke alamat Anda dalam 30-60 menit",
    color: "bg-orange-500",
    shadow: "shadow-orange-500/30",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Cara Belanja Praktis
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Tiga langkah mudah untuk mendapatkan produk kesehatan tanpa keluar rumah.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid md:grid-cols-3 gap-12 md:gap-8 relative"
        >
          {/* --- GARIS PROGRES DESKTOP (HORIZONTAL) --- */}
          {/* Posisi top-20 disesuaikan agar pas di tengah ikon (tinggi ikon md:h-40 = 10rem, setengahnya 5rem/20 tailwind) */}
          <div className="hidden md:block absolute top-20 left-[16%] right-[16%] h-1 bg-slate-100 rounded-full -z-10">
            <motion.div
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.4 }}
              className="h-full bg-primary rounded-full origin-left"
            />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative flex flex-col items-center text-center group"
            >
              {/* Step Number Badge */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.2, type: "spring" }}
                className="absolute -top-4 bg-white border-4 border-slate-50 w-10 h-10 rounded-full flex items-center justify-center font-bold text-primary z-10 shadow-sm"
              >
                {index + 1}
              </motion.div>

              {/* Icon Circle Container */}
              <div className="relative mb-6">
                {/* Background Blur Effect */}
                <div
                  className={`absolute inset-0 rounded-full ${step.color} blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
                />
                
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }} 
                  transition={{ duration: 0.2 }}
                  className={`w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full ${step.color} ${step.shadow} flex items-center justify-center shadow-xl relative z-0 border-4 border-white`}
                >
                  <step.icon className="w-12 h-12 md:w-16 md:h-16 text-white drop-shadow-md" />
                </motion.div>
              </div>

              {/* Text Content */}
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors duration-300">
                {step.title}
              </h3>
              <p className="text-slate-500 leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>

              {/* --- GARIS PROGRES MOBILE (VERTIKAL) --- */}
              {/* Muncul di bawah item, kecuali item terakhir */}
              {index < steps.length - 1 && (
                <div className="md:hidden absolute left-1/2 -translate-x-1/2 -bottom-12 w-1 h-12 bg-slate-100 rounded-full">
                  <motion.div
                    initial={{ height: "0%" }}
                    whileInView={{ height: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className="w-full bg-primary rounded-full origin-top"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};