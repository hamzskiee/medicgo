import React, { useEffect, useState, useRef } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Package,
  Trash2,
  Edit,
  AlertCircle,
  Upload,
  X,
  Loader2,
  Eye,
  Pill,
  Zap,
  Stethoscope,
  HeartHandshake,
  Layers,
  Bold, // Icon Bold
  Italic, // Icon Italic
  Tag, // Icon Brand
  Percent, // Icon Diskon/Promo
  Hash, // Icon Tags
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// --- INTERFACE (Updated with Brand, Tags, Original Price) ---
interface Product {
  id: string;
  name: string;
  brand?: string;
  tags?: string; // Tambah Tags
  category: string;
  price: number;
  original_price?: number; // Tambah Harga Coret
  stock: number;
  image_url?: string;
  description?: string;
  dosage?: string;
}

// --- CONFIG WARNA KATEGORI ---
const categoryColors: Record<string, string> = {
  obat: "bg-blue-100 text-blue-800 border-blue-200",
  vitamin: "bg-green-100 text-green-800 border-green-200",
  "alat-kesehatan": "bg-purple-100 text-purple-800 border-purple-200",
  "perawatan-diri": "bg-orange-100 text-orange-800 border-orange-200",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // --- STATE FORM ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Added 'brand', 'tags', 'original_price' to formData
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    tags: "", // Default empty
    category: "",
    price: "",
    original_price: "", // Default empty string
    stock: "",
    description: "",
    dosage: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ref untuk textarea description agar bisa insert tag di posisi kursor
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imgTimestamp, setImgTimestamp] = useState(Date.now());

  // --- 1. FETCH PRODUCTS ---
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
      setImgTimestamp(Date.now());
    } catch (error) {
      console.error("Gagal ambil produk:", error);
      toast.error("Gagal memuat data produk");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- 2. UPLOAD & SUBMIT ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024)
        return toast.error("Ukuran file maksimal 2MB");
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImageToSupabase = async (file: File) => {
    try {
      const fileExt = file.name.split(".").pop();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, "_");
      const filePath = `${Date.now()}_${cleanFileName}.${fileExt}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price)
      return toast.error("Nama & Harga wajib diisi");
    try {
      setIsSubmitting(true);
      let finalImageUrl = previewUrl;
      if (imageFile) {
        const url = await uploadImageToSupabase(imageFile);
        if (url) finalImageUrl = url;
        else return setIsSubmitting(false);
      }

      // Convert empty string to null for original_price
      const finalOriginalPrice = formData.original_price
        ? Number(formData.original_price)
        : null;

      const payload = {
        name: formData.name,
        brand: formData.brand,
        tags: formData.tags?.toLowerCase(), // Save tags lowercase
        category: formData.category || "obat",
        price: Number(formData.price),
        original_price: finalOriginalPrice, // Save original price
        stock: Number(formData.stock) || 0,
        image_url: finalImageUrl,
        description: formData.description,
        dosage: formData.dosage,
      };

      if (isEditing && currentId) {
        await supabase.from("products").update(payload).eq("id", currentId);
        toast.success("Produk diperbarui!");
      } else {
        await supabase.from("products").insert([{ ...payload, sold: 0 }]);
        toast.success("Produk ditambahkan!");
      }
      closeDialog();
      fetchProducts();
    } catch (error) {
      toast.error("Gagal menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HELPER UNTUK TEXT FORMATTING ---
  const insertTextTag = (tag: "b" | "i") => {
    if (!descriptionRef.current) return;

    const textarea = descriptionRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.description;

    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);

    // Wrap selected text with HTML tags
    const newText = `${before}<${tag}>${selected}</${tag}>${after}`;

    setFormData({ ...formData, description: newText });

    // Restore focus
    setTimeout(() => {
      textarea.focus();
      // Move cursor to end of inserted tag
      const newCursorPos = end + tag.length * 2 + 5;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // --- 3. ACTIONS ---
  const handleEditClick = (product: Product) => {
    setIsEditing(true);
    setCurrentId(product.id);
    setFormData({
      name: product.name,
      brand: product.brand || "",
      tags: product.tags || "", // Load Tags
      category: product.category,
      price: String(product.price),
      original_price: product.original_price
        ? String(product.original_price)
        : "", // Load Original Price
      stock: String(product.stock),
      description: product.description || "",
      dosage: product.dosage || "",
    });
    setPreviewUrl(
      product.image_url ? `${product.image_url}?t=${Date.now()}` : ""
    );
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Hapus produk ini secara permanen?")) return;
    try {
      await supabase.from("products").delete().eq("id", id);
      toast.success("Produk dihapus");
      setProducts(products.filter((p) => p.id !== id));
    } catch (e) {
      toast.error("Gagal menghapus");
    }
  };

  const handleViewClick = (product: Product) => {
    setViewProduct(product);
    setIsViewOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({
        name: "",
        brand: "",
        tags: "",
        category: "",
        price: "",
        original_price: "",
        stock: "",
        description: "",
        dosage: "",
      });
      setImageFile(null);
      setPreviewUrl("");
    }, 300);
  };

  // --- 4. FILTERING LOGIC ---
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const prodCat = product.category ? product.category.toLowerCase() : "";
    const matchesCategory =
      selectedCategory === "Semua" || prodCat === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCount = (catId: string) => {
    if (catId === "Semua") return products.length;
    return products.filter(
      (p) => (p.category ? p.category.toLowerCase() : "") === catId
    ).length;
  };

  // --- 5. CATEGORY CONFIG ---
  const categories = [
    {
      id: "Semua",
      label: "Semua Produk",
      icon: Layers,
      color: "bg-slate-100 text-slate-600 border-slate-200",
    },
    {
      id: "obat",
      label: "Obat-obatan",
      icon: Pill,
      color: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      id: "vitamin",
      label: "Vitamin",
      icon: Zap,
      color: "bg-green-50 text-green-600 border-green-200",
    },
    {
      id: "alat-kesehatan",
      label: "Alat Kesehatan",
      icon: Stethoscope,
      color: "bg-purple-50 text-purple-600 border-purple-200",
    },
    {
      id: "perawatan-diri",
      label: "Perawatan Diri",
      icon: HeartHandshake,
      color: "bg-orange-50 text-orange-600 border-orange-200",
    },
  ];

  return (
    <div className="space-y-8 p-8 min-h-screen bg-slate-50/50">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Inventaris Produk
          </h1>
          <p className="text-slate-500 mt-1">
            Total {products.length} produk terdaftar
          </p>
        </div>

        {/* ADD BUTTON */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => !open && closeDialog()}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setIsEditing(false);
                setIsDialogOpen(true);
              }}
              className="bg-primary hover:bg-primary/90 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" /> Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Produk" : "Tambah Produk Baru"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {/* Area Upload */}
              <div className="flex flex-col items-center justify-center gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-full h-48 rounded-xl border-2 border-dashed border-slate-300 hover:border-primary cursor-pointer flex flex-col items-center justify-center bg-slate-50 overflow-hidden group"
                >
                  {previewUrl ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit className="text-white w-8 h-8" />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <Upload className="w-10 h-10 mb-2" />
                      <span className="text-sm font-medium">
                        Klik untuk upload foto
                      </span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              {/* Form Inputs */}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Nama Produk *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                {/* --- INPUT BRAND & TAGS --- */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Brand (Merek)</Label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        className="pl-9"
                        placeholder="Contoh: Panadol"
                        value={formData.brand}
                        onChange={(e) =>
                          setFormData({ ...formData, brand: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Tags (Keyword Pencarian)</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        className="pl-9"
                        placeholder="sakit kepala, demam, flu"
                        value={formData.tags}
                        onChange={(e) =>
                          setFormData({ ...formData, tags: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Kategori</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      <option value="">Pilih...</option>
                      <option value="obat">Obat-obatan</option>
                      <option value="vitamin">Vitamin</option>
                      <option value="alat-kesehatan">Alat Kesehatan</option>
                      <option value="perawatan-diri">Perawatan Diri</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Stok</Label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* --- HARGA (Diskon Logic) --- */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="grid gap-2">
                    <Label className="text-slate-700">
                      Harga Jual (Final) *
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                        Rp
                      </span>
                      <Input
                        type="number"
                        className="pl-9 font-bold text-emerald-600 border-emerald-200"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-slate-500 text-xs flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      Harga Asli (Coret) - Opsional
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                        Rp
                      </span>
                      <Input
                        type="number"
                        className="pl-9 text-slate-500 line-through decoration-slate-400"
                        placeholder="Kosongkan jika bukan promo"
                        value={formData.original_price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            original_price: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Dosis</Label>
                  <Input
                    placeholder="Contoh: 3x1 tablet"
                    value={formData.dosage}
                    onChange={(e) =>
                      setFormData({ ...formData, dosage: e.target.value })
                    }
                  />
                </div>

                {/* --- DESKRIPSI DENGAN TOOLBAR --- */}
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label>Deskripsi</Label>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => insertTextTag("b")}
                        title="Bold"
                      >
                        <Bold className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => insertTextTag("i")}
                        title="Italic"
                      >
                        <Italic className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <textarea
                    ref={descriptionRef}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-sans"
                    value={formData.description}
                    placeholder="Gunakan tombol B atau I untuk format teks"
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                  <p className="text-[10px] text-slate-400">
                    Tips: Blok teks lalu klik tombol <b>B</b> atau <i>I</i>.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                Batal
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* FILTER CATEGORY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "cursor-pointer rounded-xl border p-4 transition-all duration-200 flex flex-col items-start gap-3",
              selectedCategory === cat.id
                ? `ring-2 ring-offset-2 ring-primary ${cat.color} border-transparent shadow-md`
                : "bg-white border-slate-200 hover:shadow-md text-slate-600"
            )}
          >
            <div
              className={cn(
                "p-2 rounded-lg",
                selectedCategory === cat.id ? "bg-white/20" : "bg-slate-100"
              )}
            >
              <cat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">{cat.label}</p>
              <p className="text-xs opacity-80 mt-0.5">
                {getCount(cat.id)} Item
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Cari nama produk..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-[300px]">Produk</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-12 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-slate-500"
                >
                  Tidak ada produk ditemukan di kategori{" "}
                  <b>"{selectedCategory}"</b>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow
                  key={product.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                        {product.image_url ? (
                          <img
                            src={`${product.image_url}?t=${imgTimestamp}`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) =>
                              (e.currentTarget.src =
                                "https://placehold.co/400x400?text=No+Image")
                            }
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="h-6 w-6 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1 text-base">
                          {product.name}
                        </p>
                        {/* Menampilkan indikator promo jika ada harga coret */}
                        {(product.original_price || 0) > product.price && (
                          <Badge className="text-[10px] bg-red-100 text-red-600 border-red-200 hover:bg-red-200 px-1.5 py-0 h-5 mt-1">
                            Promo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.brand ? (
                      <span className="font-medium text-slate-700">
                        {product.brand}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-xs"> - </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`font-medium ${
                        categoryColors[product.category] || "bg-slate-100"
                      }`}
                    >
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700">
                        Rp {product.price.toLocaleString("id-ID")}
                      </span>
                      {product.original_price && (
                        <span className="text-xs text-slate-400 line-through">
                          Rp {product.original_price.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          product.stock < 10 ? "text-red-600 font-bold" : ""
                        }
                      >
                        {product.stock}
                      </span>
                      {product.stock < 10 && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewClick(product)}
                        className="text-blue-500 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditClick(product)}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* DIALOG VIEW DETAIL */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <div className="w-full h-64 bg-slate-100 relative">
            {viewProduct?.image_url ? (
              <img
                src={`${viewProduct.image_url}?t=${imgTimestamp}`}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-12 w-12 text-slate-300" />
              </div>
            )}
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              {viewProduct?.category}
            </div>
            {viewProduct?.brand && (
              <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-lg text-sm font-semibold backdrop-blur">
                {viewProduct.brand}
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {viewProduct?.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-emerald-600 font-bold text-lg">
                    Rp {viewProduct?.price.toLocaleString("id-ID")}
                  </p>
                  {viewProduct?.original_price && (
                    <p className="text-slate-400 text-sm line-through">
                      Rp {viewProduct?.original_price.toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase font-bold">
                  Stok
                </p>
                <p className="text-lg font-bold text-slate-700">
                  {viewProduct?.stock}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">
                  Dosis / Aturan Pakai
                </p>
                <p className="text-sm font-medium text-slate-800">
                  {viewProduct?.dosage || "-"}
                </p>
              </div>
              {/* TAGS DETAIL VIEW */}
              {viewProduct?.tags && (
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">
                    Tags (Keyword)
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {viewProduct.tags.split(",").map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-[10px] bg-slate-100 text-slate-600"
                      >
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">
                  Deskripsi
                </p>
                {/* RENDER HTML DESKRIPSI AGAR BOLD/ITALIC MUNCUL */}
                <div
                  className="text-sm text-slate-600 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: viewProduct?.description || "Tidak ada deskripsi.",
                  }}
                />
              </div>
            </div>
            <div className="mt-6">
              <Button className="w-full" onClick={() => setIsViewOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
