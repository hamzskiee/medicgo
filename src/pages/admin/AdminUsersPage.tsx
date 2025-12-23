import { useEffect, useState } from "react";
import {
  Search,
  MoreHorizontal,
  User,
  Mail,
  Phone,
  Calendar,
  Loader2,
  CheckCircle,
  XCircle,
  FileText, // Icon untuk Resep
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// --- INTERFACE ---
interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  status: "active" | "inactive" | "banned";
  avatar_url?: string;
  // Kita ambil count dari kedua tabel
  orders: { count: number }[];
  prescriptions: { count: number }[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // --- 1. FETCH DATA ---
  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Query diperbarui: Ambil count orders DAN count prescriptions
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          *,
          orders:orders(count),
          prescriptions:prescriptions(count)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter admin
      const cleanData = (data || []).filter(
        (user) => user.email?.toLowerCase() !== "admin@medicgo.com"
      );

      // Mapping data
      const mappedData: UserProfile[] = cleanData.map((item: any) => ({
        id: item.id,
        full_name: item.full_name,
        email: item.email,
        phone: item.phone,
        created_at: item.created_at,
        status: item.status,
        avatar_url: item.avatar_url,
        orders: item.orders || [],
        prescriptions: item.prescriptions || [],
      }));

      setUsers(mappedData);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- 2. UPDATE STATUS ---
  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      setProcessingId(userId);
      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", userId);

      if (error) throw error;

      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, status: newStatus as any } : user
        )
      );
      toast.success(`Status pengguna diubah: ${newStatus}`);
    } catch (error: any) {
      toast.error("Gagal update status.");
    } finally {
      setProcessingId(null);
    }
  };

  // --- FILTERING ---
  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = (user.full_name || "")
      .toLowerCase()
      .includes(searchLower);
    const emailMatch = (user.email || "").toLowerCase().includes(searchLower);
    return nameMatch || emailMatch;
  });

  // --- STATISTIK ---
  const activeUsers = users.filter(
    (u) => u.status === "active" || !u.status
  ).length;

  // Hitung total gabungan (Order Produk + Upload Resep)
  const totalActivities = users.reduce(
    (sum, u) =>
      sum + (u.orders?.[0]?.count || 0) + (u.prescriptions?.[0]?.count || 0),
    0
  );

  return (
    <div className="space-y-6 p-2 md:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Pengguna
          </h1>
          <p className="text-slate-500">
            Kelola data pelanggan dan riwayat aktivitas mereka.
          </p>
        </div>
        <Button
          onClick={fetchUsers}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Loader2 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />{" "}
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Pengguna
            </CardTitle>
            <User className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {users.length}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Pengguna Aktif
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {activeUsers}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Transaksi
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {totalActivities}
            </div>
            <p className="text-xs text-slate-500 mt-1">Termasuk upload resep</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Table */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Cari nama atau email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="font-semibold text-slate-600">
                Pengguna
              </TableHead>
              <TableHead className="font-semibold text-slate-600">
                Kontak
              </TableHead>
              <TableHead className="font-semibold text-slate-600">
                Bergabung
              </TableHead>
              <TableHead className="font-semibold text-slate-600">
                Aktivitas
              </TableHead>
              <TableHead className="font-semibold text-slate-600">
                Status
              </TableHead>
              <TableHead className="text-right font-semibold text-slate-600">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <div className="h-10 bg-slate-50 animate-pulse rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-slate-500"
                >
                  Tidak ada pengguna.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const orderCount = user.orders?.[0]?.count || 0;
                const prescCount = user.prescriptions?.[0]?.count || 0;
                const totalCount = orderCount + prescCount;
                const isActive = user.status === "active" || !user.status;

                return (
                  <TableRow key={user.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="border">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {user.full_name?.substring(0, 2).toUpperCase() ||
                              "UN"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user.full_name || "Tanpa Nama"}
                          </p>
                          <p className="text-xs text-slate-400 font-mono truncate max-w-[100px]">
                            {user.id.split("-")[0]}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" /> {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" /> {user.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {new Date(user.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {totalCount} Transaksi
                      </Badge>
                      {prescCount > 0 && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          ({prescCount} Resep)
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={processingId === user.id}
                          >
                            {processingId === user.id ? (
                              <Loader2 className="animate-spin h-4 w-4" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              navigator.clipboard.writeText(user.email)
                            }
                          >
                            Salin Email
                          </DropdownMenuItem>
                          {isActive ? (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() =>
                                handleUpdateStatus(user.id, "inactive")
                              }
                            >
                              Nonaktifkan
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() =>
                                handleUpdateStatus(user.id, "active")
                              }
                            >
                              Aktifkan
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
