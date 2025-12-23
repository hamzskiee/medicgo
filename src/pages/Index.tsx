import React from "react";
import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { CategorySection } from "@/components/home/CategorySection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { WhyChooseSection } from "@/components/home/WhyChooseSection";
import { BrandsSection } from "@/components/home/BrandsSection";
import { FAQSection } from "@/components/home/FAQSection";
import { ProductsSection } from "@/components/home/ProductsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";

const Index: React.FC = () => {
  return (
    <Layout>
      <HeroSection />
      <CategorySection />
      <ProductsSection
        title="Promo Spesial"
        subtitle="Diskon hingga 50% untuk produk pilihan"
        type="featured"
      />
      <WhyChooseSection />
      <HowItWorksSection />
      <ProductsSection
        title="Produk Populer"
        subtitle="Produk terlaris pilihan pelanggan"
        type="popular"
      />
      <BrandsSection />
      <TestimonialsSection />
      <FAQSection />
    </Layout>
  );
};

export default Index;
