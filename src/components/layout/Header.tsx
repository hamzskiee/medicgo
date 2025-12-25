import React, { useState, useEffect } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Upload,
  Lock,
  Package,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import medicGoLogo from "@/assets/medicgo-logo.png";

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Hooks Router
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Context
  const { totalItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();

  // 1. SINKRONISASI INPUT DENGAN URL
  // Jika URL berubah (misal user klik kategori), update atau kosongkan kolom search
  useEffect(() => {
    if (location.pathname === "/produk") {
      setSearchQuery(searchParams.get("search") || "");
    } else {
      setSearchQuery("");
    }
  }, [location.pathname, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Encode URI component agar karakter spasi/% aman
      navigate(`/produk?search=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { label: "Beranda", href: "/", requiresAuth: false },
    { label: "Obat", href: "/produk?category=obat", requiresAuth: false },
    { label: "Vitamin", href: "/produk?category=vitamin", requiresAuth: false },
    {
      label: "Alat Kesehatan",
      href: "/produk?category=alat-kesehatan",
      requiresAuth: false,
    },
    {
      label: "Perawatan Diri",
      href: "/produk?category=perawatan-diri",
      requiresAuth: false,
    },
    { label: "Pesanan Saya", href: "/pesanan", requiresAuth: true },
    { label: "Lacak Pesanan", href: "/lacak-pesanan", requiresAuth: true },
  ];

  // 2. FUNGSI NAVIGASI MANUAL (SOLUSI UTAMA)
  // Menangani klik link agar bekerja walau di halaman yang sama
  const handleNavigation = (e: React.MouseEvent, link: any) => {
    e.preventDefault(); // Mencegah reload browser default

    // Cek Login
    if (link.requiresAuth && !isAuthenticated) {
      navigate("/auth", { state: { from: link.href } });
    } else {
      // Navigasi normal (React Router akan mendeteksi perubahan query param)
      navigate(link.href);
    }

    setIsMenuOpen(false); // Tutup menu mobile jika terbuka
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-20 lg:h-28 gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src={medicGoLogo}
              alt="MedicGo Logo"
              className="h-16 lg:h-24 w-auto object-contain transition-transform hover:scale-105 duration-300"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </Link>

          {/* Search bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl mx-auto px-6"
          >
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                type="search"
                placeholder="Cari obat, vitamin, alat kesehatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-12 rounded-full border-slate-200 bg-slate-50 focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm w-full"
              />
            </div>
          </form>

          {/* Actions Area (Right Side) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Upload Resep Button */}
            <Link to="/upload-resep" className="hidden lg:block">
              <Button
                variant="outline"
                className="rounded-full border-primary/20 text-primary hover:bg-primary/5 hover:border-primary gap-2 h-10 px-5 font-medium transition-all shadow-sm"
              >
                <Upload className="h-4 w-4" />
                Upload Resep
              </Button>
            </Link>

            {/* Cart Button */}
            <Link to="/keranjang" className="relative group">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 rounded-full hover:bg-slate-100 text-slate-600"
              >
                <ShoppingCart className="h-5 w-5 group-hover:text-primary transition-colors" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white text-[10px] rounded-full ring-2 ring-white animate-in zoom-in">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Separator */}
            <div className="hidden sm:block h-8 w-[1px] bg-slate-200 mx-1"></div>

            {/* User Profile / Auth */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="rounded-full pl-2 pr-4 gap-2 h-10 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col items-start text-xs text-left">
                        <span className="font-semibold text-slate-700 max-w-[80px] truncate">
                          {user?.name}
                        </span>
                      </div>
                      <ChevronDown className="h-3 w-3 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 p-2 rounded-xl shadow-lg border-slate-100"
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => navigate("/profil")}
                      className="cursor-pointer rounded-lg"
                    >
                      <User className="mr-2 h-4 w-4" /> Profil Saya
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/pesanan")}
                      className="cursor-pointer rounded-lg"
                    >
                      <Package className="mr-2 h-4 w-4" /> Pesanan Saya
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        logout();
                        navigate("/"); // Redirect ke home setelah logout
                      }}
                      className="cursor-pointer text-red-600 focus:text-red-600 rounded-lg bg-red-50 focus:bg-red-100"
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link to="/auth" className="hidden sm:block">
                <Button className="rounded-full px-6 h-10 font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
                  Masuk / Daftar
                </Button>
              </Link>
            )}

            {/* Mobile Menu Trigger */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-10 w-10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center justify-center gap-1 pb-4 overflow-x-auto scrollbar-hide">
          <TooltipProvider>
            {navLinks.map((link) => {
              const isProtectedAndNotAuth =
                link.requiresAuth && !isAuthenticated;

              // Komponen Link Dasar
              const LinkComponent = (
                <a // Ganti Link dengan 'a' atau div tapi di-handle onClick manual
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavigation(e, link)}
                  className={cn(
                    "cursor-pointer px-5 py-2 text-sm font-medium transition-all rounded-full whitespace-nowrap flex items-center gap-1.5",
                    "text-slate-600 hover:text-primary hover:bg-primary/5 active:scale-95"
                  )}
                >
                  {link.label}
                  {isProtectedAndNotAuth && (
                    <Lock className="h-3 w-3 text-slate-400" />
                  )}
                </a>
              );

              return isProtectedAndNotAuth ? (
                <Tooltip key={link.href}>
                  <TooltipTrigger asChild>{LinkComponent}</TooltipTrigger>
                  <TooltipContent>
                    <p>Login diperlukan</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                LinkComponent
              );
            })}
          </TooltipProvider>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "lg:hidden fixed inset-x-0 top-[80px] bg-white border-b border-slate-100 shadow-xl transition-all duration-300 ease-in-out z-40 overflow-hidden",
          isMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="container mx-auto px-6 py-6 space-y-6">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="search"
                placeholder="Cari obat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-full bg-slate-50 border-slate-200"
              />
            </div>
          </form>

          <nav className="grid grid-cols-2 gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavigation(e, link)}
                className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700 bg-slate-50 rounded-xl flex items-center justify-center text-center hover:bg-primary/5 hover:text-primary transition-colors border border-slate-100"
              >
                {link.label}
                {link.requiresAuth && !isAuthenticated && (
                  <Lock className="ml-2 h-3 w-3 opacity-50" />
                )}
              </a>
            ))}
          </nav>

          <div className="pt-4 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate("/profil");
                    setIsMenuOpen(false);
                  }}
                  className="w-full mt-4 justify-start h-12 rounded-xl"
                >
                  <User className="mr-3 h-5 w-5" /> Profil Saya
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    logout();
                    navigate("/");
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-3 h-5 w-5" /> Keluar
                </Button>
              </div>
            ) : (
              <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20">
                  Masuk / Daftar Akun
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
