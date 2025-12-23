import React from "react";
import { Headphones, Thermometer, MapPin, CreditCard } from "lucide-react";
import { motion, Variants } from "framer-motion"; // Import Variants

const features = [
  {
    icon: Headphones,
    title: "Konsultasi 24/7",
    description: "Chat langsung dengan apoteker profesional kapan saja.",
  },
  {
    icon: Thermometer,
    title: "Suhu Terjaga",
    description: "Obat dikirim dengan kemasan khusus & suhu aman.",
  },
  {
    icon: MapPin,
    title: "Lacak Kurir",
    description: "Pantau posisi paket Anda secara real-time di peta.",
  },
  {
    icon: CreditCard,
    title: "Bayar Mudah",
    description: "Bisa COD, QRIS, Transfer Bank, & E-Wallet.",
  },
];

// Definisi Tipe Variants agar tidak error
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Muncul berurutan
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

export const WhyChooseSection: React.FC = () => {
  return (
    <section className="py-20 bg-primary relative overflow-hidden">
      {/* Background Ornament (Lingkaran Hiasan) */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-primary-foreground/10 text-primary-foreground/90 text-sm font-medium mb-3 border border-primary-foreground/20">
            Kenapa Kami?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 leading-tight">
            Kesehatan Anda, <br className="hidden md:block" /> Prioritas Kami
          </h2>
          <p className="text-primary-foreground/70 max-w-lg mx-auto text-base md:text-lg">
            Kami menghadirkan standar pelayanan farmasi modern langsung ke
            genggaman Anda.
          </p>
        </motion.div>

        {/* Feature Grid (Card Style) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8 }} // Kartu naik sedikit saat di-hover
              className="bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 p-6 rounded-3xl hover:bg-primary-foreground/10 transition-all duration-300 group"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors shadow-inner">
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>

              {/* Text */}
              <h3 className="text-lg font-bold text-primary-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-primary-foreground/70 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
