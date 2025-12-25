import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

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
  description?: string;
  brand?: string;
  tags?: string[];
  isPromo?: boolean;
  requiresPrescription?: boolean;
}

// 1. KAMUS LABEL (Hanya untuk Tampilan di Layar)
const CATEGORY_LABELS: Record<string, string> = {
  semua: "Semua",
  obat: "Obat",
  vitamin: "Vitamin",
  "alat-kesehatan": "Alat Kesehatan",
  "perawatan-diri": "Perawatan Diri",
};

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Ambil dari URL & Paksa Lowercase (biar cocok dgn database: "alat-kesehatan")
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = (
    searchParams.get("category") || "semua"
  ).toLowerCase();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil list key kategori (semua, obat, alat-kesehatan, dll)
  const categories = Object.keys(CATEGORY_LABELS);

  // --- SINKRONISASI URL KE STATE ---
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlCategory = (searchParams.get("category") || "semua").toLowerCase();

    setSearchQuery(urlSearch);
    setSelectedCategory(urlCategory);
  }, [searchParams]);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = supabase.from("products").select("*");

        // 1. Filter Text
        if (searchQuery) {
          const term = `%${searchQuery}%`;
          query = query.or(
            `name.ilike.${term},brand.ilike.${term},tags.ilike.${term},description.ilike.${term}`
          );
        }

        // 2. Filter Kategori (PERBAIKAN DISINI)
        // Karena di DB isinya "alat-kesehatan", kita pakai LANGSUNG selectedCategory
        if (selectedCategory && selectedCategory !== "semua") {
          query = query.eq("category", selectedCategory);
        }

        query = query.order("created_at", { ascending: false });

        const { data, error } = await query;
        if (error) throw error;

        if (data) {
          const mappedProducts: Product[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            originalPrice: item.original_price,
            image: item.image_url,
            category: item.category,
            rating: item.rating || 0,
            reviewCount: item.review_count || 0,
            stock: item.stock,
            isPromo: item.original_price > item.price,
            description: item.description || "",
            brand: item.brand || "",
            tags: item.tags ? item.tags.split(",") : [],
            requiresPrescription: item.requires_prescription || false,
          }));
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ search: searchQuery, category: selectedCategory });
  };

  const handleCategoryChange = (catKey: string) => {
    if (catKey === "semua") {
      setSearchParams({ search: searchQuery, category: "semua" });
    } else {
      setSearchParams({ search: searchQuery, category: catKey });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Katalog Produk
            </h1>
            <p className="text-muted-foreground mt-1">
              Temukan obat dan kebutuhan kesehatan Anda
            </p>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex gap-2 w-full md:w-auto"
          >
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, gejala..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchParams({ search: "", category: selectedCategory });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Filter Produk</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold mb-2">Kategori</h3>
                  <div className="flex flex-col gap-2">
                    {categories.map((catKey) => (
                      <Button
                        key={catKey}
                        variant={
                          selectedCategory === catKey ? "default" : "ghost"
                        }
                        className="justify-start"
                        onClick={() => handleCategoryChange(catKey)}
                      >
                        {/* Tampilkan Label Cantik */}
                        {CATEGORY_LABELS[catKey]}
                      </Button>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </form>
        </div>

        {/* Categories Chips (Desktop) */}
        <div className="hidden md:flex flex-wrap gap-2 mb-8">
          {categories.map((catKey) => (
            <Badge
              key={catKey}
              variant={selectedCategory === catKey ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm hover:bg-primary/90 hover:text-primary-foreground transition-colors"
              onClick={() => handleCategoryChange(catKey)}
            >
              {/* Tampilkan Label Cantik */}
              {CATEGORY_LABELS[catKey]}
            </Badge>
          ))}
        </div>

        {/* Info & Grid Produk */}
        {searchQuery && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Hasil Pencarian: "{searchQuery}"
            </h2>
            <p className="text-muted-foreground text-sm">
              {products.length} produk ditemukan
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[80%]" />
                  <Skeleton className="h-4 w-[50%]" />
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Produk tidak ditemukan
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                Coba reset filter atau cek database Anda.
              </p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("semua");
                  setSearchParams({});
                }}
                className="mt-4"
              >
                Reset Pencarian
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;
