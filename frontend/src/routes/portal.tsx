import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Search,
  MapPin,
  Clock,
  Calendar,
  AlertCircle,
  Phone,
} from "lucide-react";
import { api, type ListaEsperaResponse } from "@/lib/api";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Consulta tu estado — Portal del Paciente | RedNorte" },
      {
        name: "description",
        content:
          "Consulta tu posición en lista de espera médica con tu RUT y código de derivación.",
      },
    ],
  }),
  component: PortalPage,
});

type Result = {
  nombre: string;
  especialidad: string;
  establecimiento: string;
  posicion: string;
  tiempo: string;
  fecha: string;
  telefono?: string | null;
};

function PortalPage() {
  const [rut, setRut] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const validateRut = (v: string) => /\./.test(v) && /-/.test(v);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!validateRut(rut) || codigo.trim().length < 3) {
      setError(
        "No encontramos un registro con esos datos. Verifica tu RUT y código de derivación.",
      );
      return;
    }
    setLoading(true);
    try {
      const data = await api.consultaPublica(rut, codigo);
      setResult(toPortalResult(data));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No encontramos un registro con esos datos. Verifica tu RUT y código de derivación.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/images/isotipo_minsal.jpg"
              alt="RedNorte"
              className="h-9 w-9 rounded-lg object-cover"
            />
            <span className="text-lg font-bold text-navy">RedNorte</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-navy">
            Consulta tu estado en lista de espera
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Ingresa tu RUT y el código de derivación que recibiste de tu médico.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div>
            <label
              htmlFor="rut"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Tu RUT
            </label>
            <input
              id="rut"
              type="text"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              placeholder="12.345.678-9"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/20"
              required
            />
          </div>
          <div>
            <label
              htmlFor="cod"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Código de derivación
            </label>
            <input
              id="cod"
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="RN-001"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/20"
              required
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-[#C62828]/20 bg-[#C62828]/5 p-3 text-sm text-[#C62828]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-navy/90 disabled:opacity-60"
          >
            {loading ? (
              "Consultando..."
            ) : (
              <>
                <Search className="h-4 w-4" /> Consultar estado
              </>
            )}
          </button>
        </form>

        {result && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-navy px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-white/70">
                    Paciente
                  </div>
                  <div className="mt-0.5 text-lg font-semibold">
                    {result.nombre}
                  </div>
                </div>
                <span className="rounded-full bg-[#E65100] px-3 py-1 text-xs font-semibold">
                  En espera
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
              <Field
                icon={<Calendar className="h-4 w-4" />}
                label="Especialidad"
                value={result.especialidad}
              />
              <Field
                icon={<MapPin className="h-4 w-4" />}
                label="Establecimiento"
                value={result.establecimiento}
              />
              <Field
                icon={<Search className="h-4 w-4" />}
                label="Tu posición"
                value={result.posicion}
                highlight
              />
              <Field
                icon={<Clock className="h-4 w-4" />}
                label="Tiempo estimado"
                value={result.tiempo}
              />
            </div>
            <div className="border-t border-slate-100 bg-[#F4F7FB] px-6 py-4 text-xs text-slate-600">
              Última actualización: {result.fecha}
            </div>
            <div className="flex items-start gap-2 border-t border-slate-100 px-6 py-4 text-sm text-slate-700">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
              <span>
                Recibirás un SMS al{" "}
                <strong>{result.telefono || "+569XXXXXXXX"}</strong> cuando tu
                cita esté disponible.
              </span>
            </div>
            <div className="border-t border-slate-100 px-6 py-4">
              <button className="w-full rounded-lg border border-navy/30 px-4 py-2.5 text-sm font-medium text-navy transition hover:bg-navy/5">
                Actualizar mis datos de contacto
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-500">
        {icon} {label}
      </div>
      <div
        className={`mt-1 text-sm font-semibold ${highlight ? "text-teal" : "text-navy"}`}
      >
        {value}
      </div>
    </div>
  );
}

function toPortalResult(data: ListaEsperaResponse): Result {
  return {
    nombre: data.paciente?.nombre || "Paciente RedNorte",
    especialidad: data.especialidad,
    establecimiento: data.establecimiento,
    posicion:
      data.diasEspera != null
        ? `${data.diasEspera} días en espera`
        : "En lista de espera",
    tiempo: data.fechaCita
      ? `Cita programada para ${formatDate(data.fechaCita)}`
      : "Por confirmar",
    fecha: new Date().toLocaleDateString("es-CL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    telefono: data.paciente?.telefono,
  };
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
