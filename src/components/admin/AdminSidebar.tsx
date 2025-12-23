import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package, // Ikon untuk Produk (sebagai fallback)
  ShoppingCart,
  Users,
  Pill,
  FileText, // [BARU] Import icon untuk Resep
} from "lucide-react";
import { cn } from "@/lib/utils";

// Update daftar menu di sini
const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Pesanan", url: "/admin/orders", icon: ShoppingCart },

  // [BARU] Menu Verifikasi Resep ditambahkan di sini
  { title: "Verifikasi Resep", url: "/admin/resep", icon: FileText },

  { title: "Produk", url: "/admin/products", icon: Pill },
  { title: "Pengguna", url: "/admin/users", icon: Users },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col sticky top-0 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Pill className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground tracking-tight">
              MedicGo
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            // Logika Active State
            // 1. Jika URL sama persis (misal /admin)
            // 2. Atau jika URL diawali dengan link menu (misal /admin/products/add akan tetap aktif di menu Produk)
            // KECUALI Dashboard (/admin), karena semua link diawali /admin, jadi dashboard butuh pengecualian khusus.
            const isActive =
              item.url === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(item.url);

            return (
              <li key={item.title}>
                <NavLink
                  to={item.url}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                      isActive ? "scale-110" : "group-hover:scale-110"
                    )}
                  />
                  <span className="relative z-10">{item.title}</span>

                  {/* Efek Hover Halus */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-slate-50/50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-foreground truncate">
              Admin
            </p>
            <p className="text-xs text-muted-foreground truncate">
              admin@medicgo.com
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
