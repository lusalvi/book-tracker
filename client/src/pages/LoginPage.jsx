import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();

  async function handleGoogleSuccess(credentialResponse) {
    try {
      setError("");
      setLoadingGoogle(true);

      const id_token = credentialResponse.credential;
      await loginWithGoogle(id_token); // va a /api/auth/login/google

      navigate("/");
    } catch (e) {
      setError(e.message || "Hubo un problema al iniciar sesión con Google.");
    } finally {
      setLoadingGoogle(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-stone-800">
          Iniciar sesión
        </h2>

        <div className="flex justify-center mb-4">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("No se pudo iniciar sesión con Google")}
            useOneTap={false}
          />
        </div>

        {loadingGoogle && (
          <p className="mb-2 text-center text-sm text-stone-500">
            Conectando con Google…
          </p>
        )}

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
