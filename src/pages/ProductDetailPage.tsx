import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  Minus,
  Plus,
  FileText,
  Truck,
  Shield,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
// Kita ganti sumber datanya ke Supabase
import { supabase } from "../lib/supabase";

// 1. Definisikan Struktur Data (Sama persis kayak di ProductsPage)
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  category: string;
  stock: number;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  dosage?: string;
  usage?: string;
  requiresPrescription?: boolean;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  // State untuk menampung data dari database
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // 2. FUNGSI FETCH DATA DARI SUPABASE
  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!id) return;

      try {
        setLoading(true);
        // Ambil 1 produk berdasarkan ID-nya
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single(); // .single() artinya cuma ambil satu baris

        if (error) throw error;

        if (data) {
          // Lakukan Mapping (Terjemahkan bahasa Database ke bahasa Aplikasi)
          const formattedProduct: Product = {
            id: data.id,
            name: data.name,
            price: data.price,
            originalPrice: data.original_price, // Mapping harga coret
            image: data.image_url, // Mapping gambar
            description: data.description,
            category: data.category,
            stock: data.stock,
            brand: data.brand || "Umum",
            rating: data.rating || 0,
            reviewCount: data.review_count || 0,
            dosage: data.dosage || "Ikuti anjuran dokter",
            usage: data.usage_info || "Baca aturan pakai", // Mapping usage_info
            requiresPrescription: data.requires_prescription || false,
          };

          setProduct(formattedProduct);
        }
      } catch (error) {
        console.error("Gagal mengambil detail produk:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id]); // Dijalankan setiap kali ID berubah

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  // Tampilan Loading
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Sedang memuat detail produk...</p>
        </div>
      </Layout>
    );
  }

  // Tampilan Jika Produk Tidak Ditemukan (Setelah loading selesai)
  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Produk tidak ditemukan</h1>
          <p className="text-muted-foreground mb-4">
            Mungkin produk ini sudah dihapus dari database.
          </p>
          <Button onClick={() => navigate("/produk")}>
            Kembali ke Katalog
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {product.brand}
              </p>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-orange-500 text-orange-500" />
                <span className="font-medium">{product.rating}</span>
                <span className="text-muted-foreground">
                  ({product.reviewCount} ulasan)
                </span>
                {product.requiresPrescription && (
                  <Badge variant="secondary" className="gap-1">
                    <FileText className="h-3 w-3" />
                    Butuh Resep
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
            </div>

            <div 
              className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }} 
            />

            {(product.dosage || product.usage) && (
              <div className="bg-muted/50 rounded-xl p-4">
                {product.dosage && (
                  <p className="font-medium mb-1">Dosis: {product.dosage}</p>
                )}
                {product.usage && (
                  <p className="text-sm text-muted-foreground">
                    {product.usage}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-xl">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                className="flex-1 h-12 gap-2"
                onClick={() => addToCart(product as any, quantity)}
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="h-5 w-5" />
                {product.stock > 0 ? "Tambah ke Keranjang" : "Stok Habis"}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-secondary" />
                <div>
                  <p className="font-medium text-sm">Pengiriman Cepat</p>
                  <p className="text-xs text-muted-foreground">30-60 menit</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Produk Asli</p>
                  <p className="text-xs text-muted-foreground">100% Original</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
