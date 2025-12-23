import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { User, Address } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  verifyEmail: (email: string, token: string) => Promise<boolean>; // FUNGSI BARU
  logout: () => Promise<void>;
  addAddress: (address: Omit<Address, "id">) => void;
  updateAddress: (address: Address) => void;
  deleteAddress: (addressId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. INISIALISASI ---
  useEffect(() => {
    const mapSupabaseUserToAppUser = (sbUser: any): User => {
      return {
        id: sbUser.id,
        email: sbUser.email || "",
        name: sbUser.user_metadata?.full_name || "User",
        phone: sbUser.phone || "",
        addresses: [],
      };
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) setUser(mapSupabaseUserToAppUser(session.user));
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) setUser(mapSupabaseUserToAppUser(session.user));
      else setUser(null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- 2. LOGIN ---
  const login = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success("Login berhasil!");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Email atau password salah");
      return false;
    }
  }, []);

  // --- 3. REGISTER ---
  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });

        if (error) throw error;

        if (data.user && !data.session) {
          // Berhasil daftar, tapi butuh verifikasi (session null)
          return true;
        }

        toast.success("Pendaftaran berhasil!");
        return true;
      } catch (error: any) {
        toast.error(error.message);
        return false;
      }
    },
    []
  );

  // --- 4. VERIFY EMAIL (OTP) ---
  const verifyEmail = useCallback(async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup", // Tipe 'signup' khusus untuk verifikasi pendaftaran
      });

      if (error) throw error;

      toast.success("Email berhasil diverifikasi! Anda telah masuk.");
      return true;
    } catch (error: any) {
      console.error("Verify Error:", error);
      toast.error(error.message || "Kode verifikasi salah atau kadaluarsa.");
      return false;
    }
  }, []);

  // --- 5. LOGOUT ---
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    localStorage.removeItem("adminAuth");
    toast.success("Anda telah keluar.");
  }, []);

  // --- MOCK ADDRESS FUNCTIONS ---
  const addAddress = useCallback(
    (address: Omit<Address, "id">) => {
      if (!user) return;
      const newAddress: Address = { ...address, id: `addr-${Date.now()}` };
      setUser((prev) =>
        prev ? { ...prev, addresses: [...prev.addresses, newAddress] } : null
      );
      toast.success("Alamat ditambahkan (Local)");
    },
    [user]
  );

  const updateAddress = useCallback(
    (address: Address) => {
      /* logic sama */
    },
    [user]
  );
  const deleteAddress = useCallback(
    (addressId: string) => {
      /* logic sama */
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!session,
        isLoading,
        login,
        register,
        verifyEmail,
        logout,
        addAddress,
        updateAddress: () => {},
        deleteAddress: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
