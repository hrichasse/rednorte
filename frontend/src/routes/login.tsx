import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Acceso Funcionarios | RedNorte" },
      {
        name: "description",
        content:
          "Acceso exclusivo para funcionarios del Servicio Público de Salud RedNorte.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [establecimiento, setEstablecimiento] = useState(
    "Hospital Regional del Norte",
  );
  const [rol, setRol] = useState<"MEDICO" | "ADMINISTRATIVO">("ADMINISTRATIVO");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await api.login(email, password);
      } else {
        await api.register({
          nombre,
          email,
          password,
          establecimiento,
          rol,
        });
      }
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : mode === "login"
            ? "No fue posible iniciar sesion"
            : "No fue posible registrar el funcionario",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F7FB] px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <img
            src="/images/isotipo_minsal.jpg"
            alt="RedNorte"
            className="h-10 w-10 rounded-lg object-cover"
          />
          <span className="text-xl font-bold text-navy">RedNorte</span>
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-center text-2xl font-bold text-navy">
            {mode === "login" ? "Acceso Funcionarios" : "Registro Funcionario"}
          </h1>
          <p className="mt-1 text-center text-sm text-slate-600">
            {mode === "login"
              ? "Sistema de Gestión RedNorte"
              : "Personal público de salud autorizado"}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {mode === "register" && (
              <div>
                <label
                  htmlFor="nombre"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Nombre completo
                </label>
                <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre funcionario"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/20"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="funcionario@rednorte.cl"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === "register" ? 8 : undefined}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-10 text-sm outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/20"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-navy"
                  aria-label={
                    show ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {show ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <>
                <div>
                  <label
                    htmlFor="establecimiento"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Establecimiento
                  </label>
                  <input
                    id="establecimiento"
                    type="text"
                    value={establecimiento}
                    onChange={(e) => setEstablecimiento(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="rol"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Rol
                  </label>
                  <select
                    id="rol"
                    value={rol}
                    onChange={(e) =>
                      setRol(e.target.value as "MEDICO" | "ADMINISTRATIVO")
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/20"
                  >
                    <option value="ADMINISTRATIVO">Administrativo</option>
                    <option value="MEDICO">Médico</option>
                  </select>
                </div>
              </>
            )}

            {error && (
              <div className="rounded-lg border border-[#C62828]/20 bg-[#C62828]/5 p-3 text-sm text-[#C62828]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy/90 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />{" "}
                  {mode === "login" ? "Ingresando..." : "Registrando..."}
                </>
              ) : mode === "login" ? (
                "Iniciar sesión"
              ) : (
                "Registrar funcionario"
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode((current) =>
                    current === "login" ? "register" : "login",
                  );
                  setError(null);
                }}
                className="text-xs font-medium text-teal hover:underline"
              >
                {mode === "login"
                  ? "Registrar funcionario"
                  : "Ya tengo una cuenta"}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Acceso exclusivo para personal autorizado de RedNorte
        </p>
      </div>
    </div>
  );
}
