import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiVerifyEmail } from "../lib/api";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        // Extraer parámetros del hash (#access_token=...)
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        // Extraer parámetros de la query (?token_hash=...&type=signup)
        const searchParams = new URLSearchParams(window.location.search);
        const tokenHash = searchParams.get("token_hash");
        const type = searchParams.get("type");

        console.log("🔍 Parámetros recibidos:", {
          accessToken: accessToken ? "Sí" : "No",
          refreshToken: refreshToken ? "Sí" : "No",
          tokenHash: tokenHash ? "Sí" : "No",
          type,
        });

        // Caso 1: Tenemos access_token directamente (formato antiguo)
        if (accessToken) {
          localStorage.setItem("book_token", accessToken);
          if (refreshToken) {
            localStorage.setItem("book_refresh_token", refreshToken);
          }
          console.log("✅ Token guardado, redirigiendo...");
          navigate("/", { replace: true });
          return;
        }

        // Caso 2: Tenemos token_hash (formato nuevo de Supabase)
        if (tokenHash && type) {
          console.log("🔄 Verificando email con token_hash...");
          await apiVerifyEmail(tokenHash, type);
          console.log("✅ Email verificado, redirigiendo...");
          navigate("/", { replace: true });
          return;
        }

        // Si llegamos aquí, no hay parámetros válidos
        console.warn(
          "No se encontraron parámetros de autenticación en la URL. " +
            "Probablemente Supabase ya verificó el email y solo hizo el redirect limpio."
        );

        // Podés llevar al usuario al login con un mensajito
        navigate("/login", { replace: true });
      } catch (err) {
        console.error("❌ Error en callback:", err);
        setError(err.message || "Error desconocido");
      }
    }

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md rounded-lg border border-red-200 bg-white p-6 shadow-lg">
          <div className="mb-2 text-lg font-semibold text-red-600">
            Error de verificación
          </div>
          <div className="mb-4 text-sm text-gray-600">{error}</div>
          <button
            onClick={() => navigate("/login")}
            className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            Volver al login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4 text-lg font-semibold text-gray-900">
          Verificando tu email...
        </div>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
      </div>
    </div>
  );
}
