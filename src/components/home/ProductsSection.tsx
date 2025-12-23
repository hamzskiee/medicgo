import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

// --- INTERFACE ---
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  stock: number;
  isPromo?: boolean;
  description: string;
  brand: string;
  tags: string[];
  requiresPrescription: boolean;
}

interface ProductsSectionProps {
  title: string;
  subtitle?: string;
  type: "popular" | "featured"; // popular = terlaris, featured = PROMO
  showViewAll?: boolean;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  title,
  subtitle,
  type,
  showViewAll = true,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        let query = supabase.from("products").select("*");

        // --- LOGIKA FILTER YANG DIPERBAIKI ---
        if (type === "popular") {
          // Tampilkan produk terlaris (berdasarkan 'sold')
          query = query.order("sold", { ascending: false }).limit(8);
        } else if (type === "featured") {
          // KHUSUS PROMO: Hanya ambil produk yang punya original_price (tidak null)
          // Kita filter di level database dulu biar efisien
          query = query
            .not("original_price", "is", null)
            .order("created_at", { ascending: false })
            .limit(10); // Ambil lebih dulu untuk difilter lagi di JS
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data) {
          // Mapping data
          let mappedProducts: Product[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            originalPrice: item.original_price,
            image: item.image_url,
            category: item.category,
            rating: item.rating || 5.0,
            reviewCount: item.review_count || 0,
            stock: item.stock,
            isPromo: item.original_price > item.price, // Logic badge promo
            description: item.description || "",
            brand: item.brand || "",
            tags: item.tags ? item.tags.split(",") : [],
            requiresPrescription: item.requires_prescription || false,
          }));

          // --- FILTER KETAT UNTUK PROMO ---
          if (type === "featured") {
            // Pastikan hanya menampilkan produk yang BENAR-BENAR DISKON
            // Syarat: originalPrice ada DAN originalPrice > price
            mappedProducts = mappedProducts.filter(
              (p) => (p.originalPrice || 0) > p.price
            );

            // Batasi tampilan maksimal 4 produk promo
            mappedProducts = mappedProducts.slice(0, 4);
          }

          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error(`Error fetching ${type} products:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [type]);

  // JIKA TIPE PROMO TAPI KOSONG, JANGAN TAMPILKAN SECTION INI
  if (type === "featured" && !loading && products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">{title}</h2>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
          {showViewAll && (
            <Link to="/produk">
              <Button variant="ghost" className="gap-2 hidden sm:flex">
                Lihat Semua
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {loading
            ? // SKELETON LOADING
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[80%]" />
                    <Skeleton className="h-4 w-[50%]" />
                  </div>
                </div>
              ))
            : // DATA ASLI
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>

        {/* Mobile View All Button */}
        {showViewAll && (
          <div className="text-center mt-8 sm:hidden">
            <Link to="/produk">
              <Button variant="outline" className="gap-2 w-full">
                Lihat Semua Produk
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
