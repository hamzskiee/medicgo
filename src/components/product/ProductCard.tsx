import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Star, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { Product } from "@/types"; // HAPUS ATAU KOMENTARI INI AGAR TIDAK KONFLIK
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

// --- DEFINISI INTERFACE LOKAL (Agar cocok dengan data dari ProductsSection) ---
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  stock: number;
  rating: number;
  reviewCount: number;
  // Properti tambahan (Optional agar aman)
  description?: string;
  brand?: string;
  tags?: string[];
  isPromo?: boolean;
  requiresPrescription?: boolean;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className,
}) => {
  const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Casting ke any jika CartContext butuh tipe strict dari @/types,
    // tapi karena struktur datanya mirip, biasanya aman.
    addToCart(product as any);
  };

  return (
    <Link to={`/produk/${product.id}`} className={cn("group block", className)}>
      <div className="bg-card rounded-2xl border border-border overflow-hidden hover-lift card-shadow h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square bg-muted/50 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground text-xs">
                -{discount}%
              </Badge>
            )}
            {product.requiresPrescription && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <FileText className="h-3 w-3" />
                Resep
              </Badge>
            )}
          </div>

          {/* Quick add button */}
          <Button
            size="icon"
            className="absolute bottom-2 right-2 h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <p className="text-xs text-muted-foreground mb-1">
            {product.brand || "-"}
          </p>
          <h3 className="font-medium text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
            <span className="text-sm font-medium text-foreground">
              {product.rating || 0}
            </span>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount || 0})
            </span>
          </div>

          {/* Price */}
          <div className="mt-auto">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
