import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/api";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const navigate = useNavigate();

  async function handleLoginWithGoogle() {
    try {
      setError("");
      setLoadingGoogle(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin, // vuelve a tu app después del callback
          queryParams: {
            // opcional: para refresh token en web
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
      // ⚠️ No se ejecuta más allá si se abre el flujo OAuth (redirecciona)
    } catch (e) {
      setError(e.message);
      setLoadingGoogle(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-stone-800">
          Iniciar sesión
        </h2>

        <button
          onClick={handleLoginWithGoogle}
          disabled={loadingGoogle}
          className="mb-4 w-full rounded-lg bg-stone-900 px-4 py-3 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60"
        >
          {loadingGoogle ? "Abriendo Google…" : "Continuar con Google"}
        </button>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
