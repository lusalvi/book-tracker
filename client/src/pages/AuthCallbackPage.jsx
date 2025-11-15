import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiVerifyEmail } from "../lib/api";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function handleCallback() {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);
        
        let accessToken = hashParams.get("access_token");
        let refreshToken = hashParams.get("refresh_token");
        let tokenHash = searchParams.get("token_hash");
        let type = searchParams.get("type");
        
        console.log('🔍 Parámetros recibidos:', {
          accessToken: accessToken ? 'Sí ✅' : 'No ❌',
          tokenHash: tokenHash ? 'Sí ✅' : 'No ❌',
          type: type || 'ninguno'
        });

        // CASO 1: Ya tenemos el access_token
        if (accessToken) {
          console.log('✅ Token encontrado directamente');
          localStorage.setItem("book_token", accessToken);
          if (refreshToken) {
            localStorage.setItem("book_refresh_token", refreshToken);
          }
          setSuccess(true);
          
          // Recargar la página para que useAuth lea el localStorage
          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
          return;
        }

        // CASO 2: Tenemos token_hash
        if (tokenHash && type) {
          console.log('🔄 Verificando email con backend...');
          const data = await apiVerifyEmail(tokenHash, type);
          console.log('✅ Email verificado:', data);
          setSuccess(true);
          
          // Recargar la página para que useAuth lea el localStorage
          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
          return;
        }

        // No hay parámetros
        console.warn('⚠️ No se encontraron parámetros');
        throw new Error('No se encontraron parámetros de verificación');

      } catch (err) {
        console.error('❌ Error en callback:', err);
        
        const errorMsg = err.message || '';
        
        if (errorMsg.includes('expired') || errorMsg.includes('expirado')) {
          setError('expired');
        } else if (errorMsg.includes('invalid') || errorMsg.includes('inválido')) {
          setError('invalid');
        } else {
          setError('unknown');
        }
      }
    }

    handleCallback();
  }, [navigate]);

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            ¡Email verificado correctamente!
          </div>
          <p className="mt-2 text-sm text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md rounded-lg border bg-white p-6 shadow-lg">
          {error === 'expired' && (
            <>
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-orange-100 p-3">
                  <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mb-2 text-center text-lg font-semibold text-gray-900">
                Link expirado o ya usado
              </div>
              <p className="mb-4 text-center text-sm text-gray-600">
                Este link ya fue utilizado. Si ya confirmaste tu email, puedes iniciar sesión normalmente.
              </p>
            </>
          )}

          {error === 'invalid' && (
            <>
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-red-100 p-3">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className="mb-2 text-center text-lg font-semibold text-gray-900">
                Link inválido
              </div>
              <p className="mb-4 text-center text-sm text-gray-600">
                El link de confirmación no es válido.
              </p>
            </>
          )}

          {error === 'unknown' && (
            <>
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-red-100 p-3">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="mb-2 text-center text-lg font-semibold text-gray-900">
                Error de verificación
              </div>
              <p className="mb-4 text-center text-sm text-gray-600">
                Hubo un problema al verificar tu email.
              </p>
            </>
          )}
          
          <button
            onClick={() => navigate("/login")}
            className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
          >
            Ir al inicio de sesión
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