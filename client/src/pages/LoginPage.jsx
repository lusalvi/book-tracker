import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
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
      await loginWithGoogle(id_token);

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
      const result = await register({ email, password, nombre, apellido });
      if (result.message) {
        alert("¡Cuenta creada! Revisa tu email para confirmarla.");
        setActiveTab("login");
      } else {
        await login({ email, password });
        navigate("/");
      }
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
    setApellido("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-rose-50 to-blue-50 px-4 py-8">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-blob animation-delay-4000"></div>
      </div>

      {/* Card principal con glassmorphism */}
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 to-rose-300 rounded-2xl blur opacity-15"></div>
        
        <div className="relative bg-white/85 backdrop-blur-xl rounded-2xl shadow-2xl border border-amber-100/30 p-8">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-100 to-rose-100 flex items-center justify-center shadow-lg p-2 ring-2 ring-amber-200 ring-offset-2">
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
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-amber-50/60 p-1 shadow-sm border border-amber-100/50 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("signup")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "signup"
                  ? "bg-white text-amber-700 shadow-sm border border-amber-200"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Registrarse
            </button>

            <button
              onClick={() => setActiveTab("login")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "login"
                  ? "bg-white text-amber-700 shadow-sm border border-amber-200"
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-20 bg-white/50 backdrop-blur-sm"
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-20 bg-white/50 backdrop-blur-sm"
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
                    className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-2 focus:ring-amber-400"
                    disabled={loadingEmail}
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Recuerdame por 30 días
                  </span>
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-amber-700 hover:text-amber-800"
                  disabled={loadingEmail}
                >
                  Olvidé mi contraseña
                </button>
              </div>

              <button
                type="submit"
                disabled={loadingEmail}
                className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-rose-400 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:shadow-md hover:from-amber-600 hover:to-rose-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="rounded-lg border border-rose-200 bg-rose-50/80 backdrop-blur-sm p-2.5 text-xs text-rose-700">
                  {error}
                </div>
              )}
            </form>
          )}

          {/* Formulario de Registro */}
          {activeTab === "signup" && (
            <form onSubmit={handleEmailRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
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
                    placeholder="Tu nombre"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-20 bg-white/50 backdrop-blur-sm"
                    required
                    disabled={loadingEmail}
                  />
                </div>

                <div>
                  <label
                    htmlFor="apellido"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Apellido
                  </label>
                  <input
                    id="apellido"
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Tu apellido"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-20 bg-white/50 backdrop-blur-sm"
                    required
                    disabled={loadingEmail}
                  />
                </div>
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-20 bg-white/50 backdrop-blur-sm"
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-20 bg-white/50 backdrop-blur-sm"
                  required
                  disabled={loadingEmail}
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loadingEmail}
                className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-rose-400 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:shadow-md hover:from-amber-600 hover:to-rose-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="rounded-lg border border-rose-200 bg-rose-50/80 backdrop-blur-sm p-2.5 text-xs text-rose-700">
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
                  className="font-medium text-amber-700 hover:text-amber-800"
                >
                  Registrarse
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes una cuenta?{" "}
                <button
                  onClick={() => switchTab("login")}
                  className="font-medium text-amber-700 hover:text-amber-800"
                >
                  Iniciar sesión
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}