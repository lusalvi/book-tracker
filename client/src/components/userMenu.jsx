import { supabase } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

export default function UserMenu() {
  const { user } = useAuth();

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.replace("/login");
  };

  if (!user) return null;
  const name = user.user_metadata?.full_name || user.email;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-stone-700">{name}</span>
      <button
        onClick={logout}
        className="rounded-md border px-3 py-1 text-xs hover:bg-stone-50"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
