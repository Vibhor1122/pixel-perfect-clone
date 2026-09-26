import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import type { Role } from "./mock-data";
import { supabase } from "./supabase";

type RoleContextValue = {
  role: Role | null;
  user: User | null;
  loading: boolean;
  refreshRole: () => Promise<void>;
};

const RoleContext = createContext<RoleContextValue>({
  role: null,
  user: null,
  loading: true,
  refreshRole: async () => {},
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUserAndRole() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      console.error("Could not load user role:", error);
      setRole(null);
    } else {
      setRole(profile.role as Role);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadUserAndRole();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUserAndRole();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <RoleContext.Provider
      value={{
        role,
        user,
        loading,
        refreshRole: loadUserAndRole,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}