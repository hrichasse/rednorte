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
  ClipboardList,
  CheckCircle2,
} from "lucide-react";
import { api, type ListaEsperaResponse } from "@/lib/api";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Consulta tu estado — Portal del Paciente | RedNorte" },
      {
        name: "description",
        content:
          "Consulta tu posición en lista de espera médica con tu RUT y número de serie de documento.",
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
  estado: string;
  fechaIngreso: string;
  hora: string;
  telefono?: string | null;
};

function PortalPage() {
  const [rut, setRut] = useState("");
  const [numeroSerie, setNumeroSerie] = useState("");
  const [results, setResults] = useState<ListaEsperaResponse[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [view, setView] = useState<"resumen" | "hora">("resumen");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateRut = (v: string) => /\./.test(v) && /-/.test(v);
  const activeResult = results[activeIndex]
    ? toPortalResult(results[activeIndex])
    : null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResults([]);
    setActiveIndex(0);
    setView("resumen");
    if (!validateRut(rut) || numeroSerie.trim().length < 6) {
      setError(
        "No encontramos un registro con esos datos. Verifica tu RUT y N° de serie.",
      );
      return;
    }
    setLoading(true);
    try {
      const data = await api.consultaPaciente(rut, numeroSerie);
      setResults(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No encontramos un registro con esos datos. Verifica tu RUT y N° de serie.",
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
              className="h-9 w-9 rounded-full object-cover"
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
            Ingresa tu RUT y el N° de serie de tu cédula para revisar tus
            derivaciones y horas médicas asociadas.
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
              htmlFor="numero-serie"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              N° de serie del documento
            </label>
            <input
              id="numero-serie"
              type="text"
              value={numeroSerie}
              onChange={(e) => setNumeroSerie(e.target.value)}
              placeholder="Ej: 123456789"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/20"
              required
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Lo encuentras en tu cédula de identidad. Para este MVP se valida
              contra datos demo.
            </p>
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

        {activeResult && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-navy px-6 py-4 text-white">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-white/70">
                    Paciente
                  </div>
                  <div className="mt-0.5 text-lg font-semibold">
                    {activeResult.nombre}
                  </div>
                </div>
                <span className="w-fit rounded-full bg-[#E65100] px-3 py-1 text-xs font-semibold">
                  {activeResult.estado}
                </span>
              </div>
            </div>

            {results.length > 1 && (
              <div className="border-b border-slate-100 bg-[#F8FAFC] px-4 py-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tus derivaciones
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {results.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveIndex(index);
                        setView("resumen");
                      }}
                      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        index === activeIndex
                          ? "border-navy bg-navy text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-navy"
                      }`}
                    >
                      {item.especialidad}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-b border-slate-100 px-6 pt-5">
              <div className="grid grid-cols-2 rounded-lg bg-[#F4F7FB] p-1 text-sm font-semibold">
                <button
                  onClick={() => setView("resumen")}
                  className={`rounded-md px-3 py-2 transition ${
                    view === "resumen"
                      ? "bg-white text-navy shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Resumen
                </button>
                <button
                  onClick={() => setView("hora")}
                  className={`rounded-md px-3 py-2 transition ${
                    view === "hora"
                      ? "bg-white text-navy shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Hora médica
                </button>
              </div>
            </div>

            {view === "resumen" ? (
              <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                <Field
                  icon={<Calendar className="h-4 w-4" />}
                  label="Especialidad"
                  value={activeResult.especialidad}
                />
                <Field
                  icon={<MapPin className="h-4 w-4" />}
                  label="Establecimiento"
                  value={activeResult.establecimiento}
                />
                <Field
                  icon={<Search className="h-4 w-4" />}
                  label="Estado actual"
                  value={activeResult.posicion}
                  highlight
                />
                <Field
                  icon={<ClipboardList className="h-4 w-4" />}
                  label="Fecha de ingreso"
                  value={activeResult.fechaIngreso}
                />
              </div>
            ) : (
              <div className="p-6">
                <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Próxima hora
                      </div>
                      <div className="mt-1 text-lg font-semibold text-navy">
                        {activeResult.tiempo}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        {activeResult.hora}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {["En espera", "Citado", "Atendido"].map((step) => (
                    <div
                      key={step}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
                        activeResult.estado === step
                          ? "border-teal bg-teal/10 text-teal"
                          : "border-slate-200 text-slate-500"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 bg-[#F4F7FB] px-6 py-4 text-xs text-slate-600">
              Última actualización: {activeResult.fecha}
            </div>
            <div className="flex items-start gap-2 border-t border-slate-100 px-6 py-4 text-sm text-slate-700">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
              <span>
                Recibirás un SMS al{" "}
                <strong>{activeResult.telefono || "+569XXXXXXXX"}</strong>{" "}
                cuando exista una actualización de tu hora médica.
              </span>
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
    estado: data.estado || "En espera",
    posicion:
      data.diasEspera != null
        ? `${data.diasEspera} días en espera`
        : "En lista de espera",
    tiempo: data.fechaCita
      ? `Cita programada para ${formatDate(data.fechaCita)}`
      : "Hora por confirmar",
    hora: data.horaCita
      ? `Hora: ${data.horaCita.slice(0, 5)}`
      : "Sin hora asignada",
    fechaIngreso: data.fechaIngreso
      ? formatDate(data.fechaIngreso)
      : "Sin fecha registrada",
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
