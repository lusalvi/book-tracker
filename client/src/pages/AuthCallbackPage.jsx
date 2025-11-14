import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiVerifyEmail } from "../lib/api";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        // Extraer todos los parámetros posibles
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);
        
        // Opción 1: access_token en hash (después de verificación exitosa)
        let accessToken = hashParams.get("access_token");
        let refreshToken = hashParams.get("refresh_token");
        
        // Opción 2: token_hash en query (link del email)
        let tokenHash = searchParams.get("token_hash");
        let type = searchParams.get("type");
        
        console.log('🔍 Parámetros recibidos:', {
          accessToken: accessToken ? 'Sí ✅' : 'No ❌',
          refreshToken: refreshToken ? 'Sí ✅' : 'No ❌',
          tokenHash: tokenHash ? 'Sí ✅' : 'No ❌',
          type: type || 'ninguno'
        });

        // CASO 1: Ya tenemos el access_token (Supabase ya hizo la verificación)
        if (accessToken) {
          console.log('✅ Token encontrado, guardando y redirigiendo...');
          localStorage.setItem("book_token", accessToken);
          if (refreshToken) {
            localStorage.setItem("book_refresh_token", refreshToken);
          }
          navigate("/", { replace: true });
          return;
        }

        // CASO 2: Tenemos token_hash, necesitamos verificarlo
        if (tokenHash && type) {
          console.log('🔄 Verificando email con backend...');
          const data = await apiVerifyEmail(tokenHash, type);
          console.log('✅ Email verificado exitosamente');
          navigate("/", { replace: true });
          return;
        }

        // CASO 3: No hay parámetros - posible error
        console.warn('⚠️ No se encontraron parámetros de autenticación');
        throw new Error('No se pudieron obtener los datos de verificación');

      } catch (err) {
        console.error('❌ Error en callback:', err);
        setError(err.message || 'Error al verificar el email');
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
        <p className="mt-4 text-sm text-gray-500">Por favor espera...</p>
      </div>
    </div>
  );
}