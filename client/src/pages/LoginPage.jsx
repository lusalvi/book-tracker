import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const { login, loginWithGoogle, register } = useAuth();

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

  async function handleEmailLogin(e) {
    e.preventDefault();
    try {
      setError("");
      setLoadingEmail(true);
      await login({ email, password });
      navigate("/");
    } catch (e) {
      setError(e.message || "Email o contraseña incorrectos.");
    } finally {
      setLoadingEmail(false);
    }
  }

  async function handleEmailRegister(e) {
    e.preventDefault();
    try {
      setError("");
      setLoadingEmail(true);
      await register({ email, password, nombre });
      // Después de registrarse, hacer login automáticamente
      await login({ email, password });
      navigate("/");
    } catch (e) {
      setError(e.message || "Error al crear la cuenta.");
    } finally {
      setLoadingEmail(false);
    }
  }

  function switchTab(tab) {
    setActiveTab(tab);
    setError("");
    setEmail("");
    setPassword("");
    setNombre("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center shadow-lg p-2">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        <h1 className="mb-1 text-center text-2xl font-bold text-gray-900">
          {activeTab === "login"
            ? "Inicia sesión a tu cuenta"
            : "Crea tu cuenta"}
        </h1>
        <p className="mb-6 text-center text-sm text-gray-600">
          {activeTab === "login"
            ? "¡Bienvenido de vuelta! Ingresa a tu cuenta para continuar."
            : "¡Únete a nosotros! Crea una cuenta para comenzar."}
        </p>

        {/* Tabs */}
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-white p-1 shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab("signup")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "signup"
                ? "bg-white text-purple-600 shadow-sm border border-purple-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Registrarse
          </button>

          <button
            onClick={() => setActiveTab("login")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "login"
                ? "bg-white text-purple-600 shadow-sm border border-purple-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Iniciar sesión
          </button>
        </div>
        {/* Formulario de Login */}
        {activeTab === "login" && (
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu email"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20"
                required
                disabled={loadingEmail}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20"
                required
                disabled={loadingEmail}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500"
                  disabled={loadingEmail}
                />
                <span className="ml-2 text-sm text-gray-600">
                  Recuerdame por 30 días
                </span>
              </label>
              <button
                type="button"
                className="text-xs font-medium text-purple-600 hover:text-purple-700"
                disabled={loadingEmail}
              >
                Olvidé mi contraseña
              </button>
            </div>

            <button
              type="submit"
              disabled={loadingEmail}
              className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingEmail ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("No se pudo iniciar sesión con Google")}
                useOneTap={false}
                theme="outline"
                size="large"
                width="384"
              />
            </div>

            {loadingGoogle && (
              <p className="text-center text-xs text-gray-500">
                Conectando con Google…
              </p>
            )}

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
                {error}
              </div>
            )}
          </form>
        )}

        {/* Formulario de Registro */}
        {activeTab === "signup" && (
          <form onSubmit={handleEmailRegister} className="space-y-4">
            <div>
              <label
                htmlFor="nombre"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Nombre
              </label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ingresa tu nombre"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20"
                required
                disabled={loadingEmail}
              />
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu email"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20"
                required
                disabled={loadingEmail}
              />
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20"
                required
                disabled={loadingEmail}
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loadingEmail}
              className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingEmail ? "Creando cuenta..." : "Registrarse"}
            </button>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("No se pudo iniciar sesión con Google")}
                useOneTap={false}
                theme="outline"
                size="large"
                width="384"
              />
            </div>

            {loadingGoogle && (
              <p className="text-center text-xs text-gray-500">
                Conectando con Google…
              </p>
            )}

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
                {error}
              </div>
            )}
          </form>
        )}

        <p className="mt-5 text-center text-xs text-gray-600">
          {activeTab === "login" ? (
            <>
              ¿No tienes una cuenta?{" "}
              <button
                onClick={() => switchTab("signup")}
                className="font-medium text-purple-600 hover:text-purple-700"
              >
                Registrarse
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes una cuenta?{" "}
              <button
                onClick={() => switchTab("login")}
                className="font-medium text-purple-600 hover:text-purple-700"
              >
                Iniciar sesión
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
