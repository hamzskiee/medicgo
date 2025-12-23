import React from "react";
import { Link } from "react-router-dom";
// Menggunakan import ikon asli Anda
import {
  MedicineIcon,
  VitaminIcon,
  DeviceIcon,
  CareIcon,
} from "@/components/icons/CategoryIcons";

const categories = [
  {
    id: "obat",
    name: "Obat-obatan",
    description: "Obat resep dan bebas",
    icon: MedicineIcon,
    color: "bg-primary/10",
    textColor: "text-primary",
  },
  {
    id: "vitamin",
    name: "Vitamin & Suplemen",
    description: "Daya tahan tubuh",
    icon: VitaminIcon,
    color: "bg-orange-light",
    textColor: "text-orange",
  },
  {
    id: "alat-kesehatan",
    name: "Alat Kesehatan",
    description: "Monitor kesehatan",
    icon: DeviceIcon,
    color: "bg-mint-light",
    textColor: "text-secondary",
  },
  {
    id: "perawatan-diri",
    name: "Perawatan Diri",
    description: "Kebersihan & perawatan",
    icon: CareIcon,
    color: "bg-medical-blue-light",
    textColor: "text-primary",
  },
];

export const CategorySection: React.FC = () => {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 md:mb-3">
            Kategori Produk
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Temukan produk kesehatan sesuai kebutuhan Anda
          </p>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/produk?category=${category.id}`}
              className="group block h-full" // h-full agar tinggi kartu sama rata
            >
              <div
                className="
                  relative bg-card 
                  rounded-xl md:rounded-2xl 
                  p-4 md:p-6 
                  border border-border 
                  hover-lift card-shadow 
                  text-center h-full 
                  flex flex-col items-center justify-center
                "
              >
                {/* Icon Container (Responsive Size) */}
                <div
                  className={`
                    inline-flex items-center justify-center 
                    w-12 h-12 md:w-16 md:h-16 
                    rounded-xl md:rounded-2xl 
                    ${category.color} 
                    mb-3 md:mb-4 
                    group-hover:scale-110 transition-transform duration-300
                  `}
                >
                  {/* Icon Size Responsive via ClassName */}
                  <category.icon
                    className={`w-6 h-6 md:w-10 md:h-10 ${category.textColor}`}
                  />
                </div>

                {/* Title (Responsive Font) */}
                <h3 className="font-semibold text-foreground mb-1 text-sm md:text-lg group-hover:text-primary transition-colors">
                  {category.name}
                </h3>

                {/* Description (Responsive Font) */}
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
