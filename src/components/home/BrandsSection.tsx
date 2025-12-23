import React from "react";
import Marquee from "react-fast-marquee"; // Khusus Mobile
import { ShieldCheck, Lock, RefreshCw } from "lucide-react";

const pharmacyBrands = [
  {
    name: "Kimia Farma",
    logo: "https://www.soocaphoto.com/wp-content/uploads/2024/06/LOGO-KIMIA-FARMA.png",
  },
  {
    name: "Apotek K-24",
    logo: "https://www.k24klik.com/blog/wp-content/uploads/2019/12/Logo-Panjang-HIGHRES.png",
  },
  {
    name: "Century",
    logo: "https://smkbahusda.sch.id/wp-content/uploads/2022/01/Logo-century.png",
  },
  {
    name: "Guardian",
    logo: "https://beachwalkbali.com/_next/image?url=https%3A%2F%2Fcms.beachwalkbali.com%2Fuploads%2FLOGO_GUARDIAN_56fdf66ab6.png&w=640&q=75",
  },
  {
    name: "Watsons",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Watsons_logotype.svg/2560px-Watsons_logotype.svg.png",
  },
  {
    name: "Viva Health",
    logo: "https://career.vivahealth.co.id/assets/logo_viva_new.png",
  },
];

const paymentMethods = [
  {
    name: "GoPay",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg",
  },
  {
    name: "DANA",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg",
  },
  {
    name: "Shopee Pay",
    logo: "https://shopeepay.co.id/blog/wp-content/uploads/2024/09/ShopeePay-Horizontal_O.png",
  },
  {
    name: "BCA",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg",
  },
  {
    name: "Mandiri",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg",
  },
  {
    name: "BNI",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Bank_Negara_Indonesia_logo_%282004%29.svg/640px-Bank_Negara_Indonesia_logo_%282004%29.svg.png",
  },
  {
    name: "BRI",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/BANK_BRI_logo_%28vertical%29.svg/640px-BANK_BRI_logo_%28vertical%29.svg.png",
  },
  {
    name: "QRIS",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg",
  },
];

export const BrandsSection: React.FC = () => {
  // Duplikasi array khusus untuk Desktop (CSS Animation)
  const duplicatedBrands = [...pharmacyBrands, ...pharmacyBrands];
  const duplicatedPayments = [...paymentMethods, ...paymentMethods];

  return (
    <section className="py-12 md:py-16 bg-background overflow-hidden">
      {/* --- HEADER APOTEK --- */}
      <div className="container mx-auto px-4 mb-8">
        <div className="text-center mb-6 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Partner Apotek Terpercaya
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Bekerjasama dengan apotek resmi di seluruh Indonesia
          </p>
        </div>
      </div>

      {/* ========================================= */}
      {/* 1. TAMPILAN MOBILE (Pakai Library)        */}
      {/* ========================================= */}
      <div className="block md:hidden mb-12">
        <Marquee gradient={false} speed={40} pauseOnHover={true}>
          {pharmacyBrands.map((brand, index) => (
            <div
              key={index}
              className="mx-2 bg-white rounded-xl p-3 flex items-center justify-center h-16 w-32 border border-border shadow-sm"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-h-10 max-w-[90%] object-contain opacity-80"
              />
            </div>
          ))}
        </Marquee>
      </div>

      {/* ========================================= */}
      {/* 2. TAMPILAN DESKTOP (Pakai Kode Asli)     */}
      {/* ========================================= */}
      <div className="hidden md:block relative mb-16 overflow-hidden">
        <div className="flex animate-marquee">
          {duplicatedBrands.map((brand, index) => (
            <div
              key={index}
              className="flex-shrink-0 mx-3 bg-white rounded-xl p-4 flex items-center justify-center h-24 w-48 border border-border hover:shadow-lg transition-shadow cursor-pointer"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-h-16 max-w-[140px] object-contain hover:scale-105 transition-transform"
              />
            </div>
          ))}
        </div>
      </div>

      {/* --- HEADER PEMBAYARAN --- */}
      <div className="container mx-auto px-4 mb-8">
        <div className="text-center mb-6 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Metode Pembayaran
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Bayar dengan mudah menggunakan berbagai metode pembayaran
          </p>
        </div>
      </div>

      {/* ========================================= */}
      {/* 1. TAMPILAN MOBILE (Pakai Library)        */}
      {/* ========================================= */}
      <div className="block md:hidden mb-12">
        <Marquee
          gradient={false}
          speed={30}
          direction="right"
          pauseOnHover={true}
        >
          {paymentMethods.map((payment, index) => (
            <div
              key={index}
              className="mx-2 bg-white rounded-xl p-2 flex items-center justify-center h-14 w-28 border border-border shadow-sm"
            >
              <img
                src={payment.logo}
                alt={payment.name}
                className="max-h-8 max-w-[80%] object-contain"
              />
            </div>
          ))}
        </Marquee>
      </div>

      {/* ========================================= */}
      {/* 2. TAMPILAN DESKTOP (Pakai Kode Asli)     */}
      {/* ========================================= */}
      <div className="hidden md:block relative mb-12 overflow-hidden">
        <div className="flex animate-marquee-reverse">
          {duplicatedPayments.map((payment, index) => (
            <div
              key={index}
              className="flex-shrink-0 mx-3 bg-white rounded-xl p-3 flex items-center justify-center h-20 w-36 border border-border shadow-sm hover:scale-105 transition-transform cursor-pointer"
            >
              <img
                src={payment.logo}
                alt={payment.name}
                className="max-h-10 max-w-[100px] object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* --- FOOTER TRUST BADGES --- */}
      <div className="container mx-auto px-4 mt-8">
        <div className="mt-8 flex flex-wrap justify-center gap-4 md:gap-6 text-muted-foreground text-xs md:text-sm font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <span>Pembayaran Aman</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <span>Terenkripsi SSL</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <span>Garansi Uang Kembali</span>
          </div>
        </div>
      </div>
    </section>
  );
};
