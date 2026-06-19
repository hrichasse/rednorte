import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import {
  ClipboardList,
  Calendar,
  RefreshCw,
  BarChart3,
  User,
  LogOut,
  TrendingUp,
  CalendarCheck,
  Clock,
  Zap,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import {
  api,
  type ActualizarListaEsperaRequest,
  type AgendaResponse,
  type CupoResponse,
  type EstadisticasResponse,
  type ListaEsperaResponse,
  type NuevaCitaRequest,
  type ReasignacionResponse,
  type ReporteResponse,
  type SugerenciaReasignacionResponse,
  type UsuarioPerfilResponse,
} from "@/lib/api";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | RedNorte" },
      {
        name: "description",
        content:
          "Panel interno de gestión del Servicio Público de Salud RedNorte.",
      },
    ],
  }),
  component: DashboardPage,
});

type SectionKey = "lista" | "agenda" | "reasignacion" | "reportes" | "perfil";

const navItems: {
  key: SectionKey;
  icon: typeof ClipboardList;
  label: string;
}[] = [
  { key: "lista", icon: ClipboardList, label: "Lista de Espera" },
  { key: "agenda", icon: Calendar, label: "Agenda de Citas" },
  { key: "reasignacion", icon: RefreshCw, label: "Reasignación de Cupos" },
  { key: "reportes", icon: BarChart3, label: "Reportes" },
  { key: "perfil", icon: User, label: "Mi Perfil" },
];

const establecimientosNorte = [
  "Hospital Regional Dr. Juan Noé Crevani - Arica",
  "Hospital Regional de Iquique Dr. Ernesto Torres Galdames - Iquique",
  "Hospital Alto Hospicio - Alto Hospicio",
  "Hospital Regional de Antofagasta Dr. Leonardo Guzmán - Antofagasta",
  "Hospital Dr. Carlos Cisternas - Calama",
  "Hospital Marcos Macuada - Tocopilla",
  "Hospital 21 de Mayo - Taltal",
  "Hospital Regional San José del Carmen - Copiapó",
  "Hospital Provincial del Huasco Monseñor Fernando Ariztía Ruiz - Vallenar",
  "Hospital San Pablo - Coquimbo",
  "Hospital San Juan de Dios - La Serena",
  "Hospital Dr. Antonio Tirado Lanas - Ovalle",
];

function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [section, setSection] = useState<SectionKey>("lista");
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const titles: Record<SectionKey, string> = {
    lista: "Lista de Espera — Hospital Regional del Norte",
    agenda: "Agenda de Citas — Hospital Regional del Norte",
    reasignacion: "Reasignación de Cupos — Hospital Regional del Norte",
    reportes: "Reportes y Estadísticas — Hospital Regional del Norte",
    perfil: "Mi Perfil — RedNorte",
  };

  return (
    <div className="flex min-h-screen bg-[#F4F7FB]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col bg-navy text-white transition-transform lg:sticky lg:top-0 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/images/isotipo_minsal.jpg"
              alt="RedNorte"
              className="h-8 w-8 rounded-full object-cover"
            />
            <div>
              <div className="text-base font-bold leading-tight">RedNorte</div>
              <div className="text-[10px] text-[#90CAF9]">
                Sistema de Gestión
              </div>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const active = section === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setSection(item.key);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-teal text-white"
                    : "text-white/90 hover:bg-white/10"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-4">
          <div className="mb-4 flex justify-center">
            <img
              src="/images/logo-minsal-grande.png"
              alt="Ministerio de Salud"
              className="h-auto max-h-32 w-[calc(100%+1.5rem)] max-w-none object-contain"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal text-sm font-semibold">
              DC
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">
                Dr. Daniel Carrasco
              </div>
              <div className="truncate text-xs text-[#90CAF9]">
                Director del Servicio
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu className="h-5 w-5 text-navy" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-navy sm:text-lg">
                {titles[section]}
              </h1>
              <p className="text-xs capitalize text-slate-500">{today}</p>
            </div>
          </div>
          <button
            onClick={() => {
              api.logout();
              navigate({ to: "/" });
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </header>

        <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {section === "lista" && <ListaEspera />}
          {section === "agenda" && <AgendaCitas />}
          {section === "reasignacion" && <ReasignacionCupos />}
          {section === "reportes" && <Reportes />}
          {section === "perfil" && <MiPerfil />}
        </div>
      </main>
    </div>
  );
}

/* ---------- Lista de Espera ---------- */

const mockPatients = [
  {
    n: 1,
    nombre: "María González Torres",
    rut: "12.345.678-9",
    esp: "Traumatología",
    dias: 187,
    prio: "ALTA",
    est: "En espera",
  },
  {
    n: 2,
    nombre: "Carlos Rojas Mendoza",
    rut: "15.234.567-8",
    esp: "Cardiología",
    dias: 143,
    prio: "ALTA",
    est: "Urgente",
  },
  {
    n: 3,
    nombre: "Ana Soto Pérez",
    rut: "11.987.654-3",
    esp: "Neurología",
    dias: 98,
    prio: "MEDIA",
    est: "En espera",
  },
  {
    n: 4,
    nombre: "Pedro Muñoz Silva",
    rut: "16.543.210-7",
    esp: "Oftalmología",
    dias: 76,
    prio: "BAJA",
    est: "Citado",
  },
  {
    n: 5,
    nombre: "Isabel Fuentes Castro",
    rut: "13.876.543-2",
    esp: "Medicina Interna",
    dias: 54,
    prio: "MEDIA",
    est: "En espera",
  },
  {
    n: 6,
    nombre: "Roberto Díaz Herrera",
    rut: "14.765.432-1",
    esp: "Cardiología",
    dias: 42,
    prio: "ALTA",
    est: "Urgente",
  },
  {
    n: 7,
    nombre: "Carmen Vidal Ramos",
    rut: "17.654.321-0",
    esp: "Traumatología",
    dias: 38,
    prio: "MEDIA",
    est: "En espera",
  },
  {
    n: 8,
    nombre: "Luis Morales Pinto",
    rut: "10.543.219-8",
    esp: "Neurología",
    dias: 21,
    prio: "BAJA",
    est: "En espera",
  },
];

const chartData = [
  { name: "Traumatología", value: 89 },
  { name: "Cardiología", value: 67 },
  { name: "Neurología", value: 54 },
  { name: "Oftalmología", value: 43 },
  { name: "Med. Interna", value: 38 },
  { name: "Otros", value: 21 },
];

type PatientRow = {
  id?: string;
  n: number;
  nombre: string;
  rut: string;
  esp: string;
  dias: number;
  prio: string;
  est: string;
};

type ListaEsperaDetailForm = {
  prioridad: NonNullable<ActualizarListaEsperaRequest["prioridad"]>;
  estado: NonNullable<ActualizarListaEsperaRequest["estado"]>;
  notas: string;
};

const estadosPaciente: ListaEsperaDetailForm["estado"][] = [
  "En espera",
  "Citado",
  "Urgente",
  "Atendido",
];

function ListaEspera() {
  const [items, setItems] = useState<ListaEsperaResponse[]>([]);
  const [rows, setRows] = useState<PatientRow[]>([]);
  const [stats, setStats] = useState<EstadisticasResponse | null>(null);
  const [selected, setSelected] = useState<ListaEsperaResponse | null>(null);
  const [detailForm, setDetailForm] = useState<ListaEsperaDetailForm>({
    prioridad: "MEDIA",
    estado: "En espera",
    notas: "",
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailSaving, setDetailSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const syncLista = (lista: ListaEsperaResponse[]) => {
    setItems(lista);
    setRows(lista.map(mapListaEsperaRow));
  };

  useEffect(() => {
    let active = true;
    async function loadDashboardData() {
      try {
        const [lista, estadisticas] = await Promise.all([
          api.getListaEspera(),
          api.getEstadisticas(),
        ]);
        if (!active) return;
        syncLista(lista);
        setStats(estadisticas);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "No fue posible cargar la lista de espera",
        );
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDashboardData();
    return () => {
      active = false;
    };
  }, []);

  const onReasignarAutomaticamente = async () => {
    setActionLoading(true);
    setError(null);
    setMessage(null);
    try {
      const asignados = await api.reasignarAutomaticamente();
      const [lista, estadisticas] = await Promise.all([
        api.getListaEspera(),
        api.getEstadisticas(),
      ]);
      syncLista(lista);
      setStats(estadisticas);
      setMessage(`${asignados.length} cupos reasignados correctamente.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible reasignar los cupos",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const onOpenDetalle = async (row: PatientRow) => {
    if (!row.id) return;

    const cached = items.find((item) => item.id === row.id) ?? null;
    if (cached) {
      setSelected(cached);
      setDetailForm(buildListaEsperaDetailForm(cached));
    }

    setDetailLoading(true);
    setError(null);
    setMessage(null);
    try {
      const detail = await api.getListaEsperaDetalle(row.id);
      setSelected(detail);
      setDetailForm(buildListaEsperaDetailForm(detail));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible cargar el detalle del paciente",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const onGuardarDetalle = async () => {
    if (!selected) return;

    setDetailSaving(true);
    setError(null);
    setMessage(null);
    try {
      const actualizado = await api.actualizarListaEspera(selected.id, {
        prioridad: detailForm.prioridad,
        estado: detailForm.estado,
        notas: detailForm.notas,
      });
      const [lista, estadisticas] = await Promise.all([
        api.getListaEspera(),
        api.getEstadisticas(),
      ]);
      syncLista(lista);
      setStats(estadisticas);
      setSelected(actualizado);
      setDetailForm(buildListaEsperaDetailForm(actualizado));
      setMessage("Detalle actualizado correctamente.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible actualizar el detalle",
      );
    } finally {
      setDetailSaving(false);
    }
  };

  const totalPacientes = stats?.totalPacientes ?? 0;
  const pacientesEnEspera = stats?.enEspera ?? 0;
  const cuposDisponibles = stats?.cuposDisponibles ?? 0;
  const cuposCancelados = stats?.cuposCancelados ?? 0;
  const reasignaciones = stats?.reasignacionesMes ?? 0;
  const tiempoPromedio =
    stats?.tiempoPromedioEspera != null
      ? `${String(stats.tiempoPromedioEspera).replace(".", ",")} meses`
      : "0 meses";
  const chartRows = stats?.porEspecialidad
    ? Object.entries(stats.porEspecialidad).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Pacientes en espera"
          value={loading ? "..." : String(pacientesEnEspera)}
          icon={TrendingUp}
          color="text-[#C62828] bg-[#C62828]/10"
          trend={`Total registrados: ${totalPacientes}`}
        />
        <Kpi
          label="Cupos disponibles"
          value={loading ? "..." : String(cuposDisponibles)}
          icon={CalendarCheck}
          color="text-[#2E7D32] bg-[#2E7D32]/10"
          trend="Disponibles para asignar"
        />
        <Kpi
          label="Cupos reasignados"
          value={loading ? "..." : String(reasignaciones)}
          icon={RefreshCw}
          color="text-teal bg-teal/10"
          trend="Cupos ocupados"
        />
        <Kpi
          label="Tiempo promedio de espera"
          value={loading ? "..." : tiempoPromedio}
          icon={Clock}
          color="text-[#E65100] bg-[#E65100]/10"
          trend="Meta: 2,9 meses"
        />
      </div>

      <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-slate-200 border-l-4 border-l-[#E65100] bg-white p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E65100]/10">
            <Zap className="h-4 w-4 text-[#E65100]" />
          </div>
          <div>
            <div className="text-sm font-semibold text-navy">
              {cuposCancelados} citas canceladas sin reasignar esta semana
            </div>
            <div className="text-xs text-slate-500">
              Reasigna los cupos automáticamente para reducir tiempos de espera.
            </div>
          </div>
        </div>
        <button
          onClick={onReasignarAutomaticamente}
          disabled={actionLoading}
          className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal/90 disabled:opacity-60"
        >
          {actionLoading ? "Reasignando..." : "Reasignar automáticamente"}
        </button>
      </div>

      {message && (
        <div className="rounded-lg border border-[#2E7D32]/20 bg-[#2E7D32]/5 p-4 text-sm text-[#2E7D32]">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-[#C62828]/20 bg-[#C62828]/5 p-4 text-sm text-[#C62828]">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 space-y-2">
            <div className="h-3 animate-pulse rounded bg-slate-100" />
            <div className="h-3 animate-pulse rounded bg-slate-100" />
            <div className="h-3 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-navy">Lista de Espera</h2>
          <p className="text-xs text-slate-500">
            {rows.length} pacientes mostrados de {totalPacientes}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#F4F7FB] text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">N°</th>
                <th className="px-4 py-3 text-left">Paciente</th>
                <th className="px-4 py-3 text-left">RUT</th>
                <th className="px-4 py-3 text-left">Especialidad</th>
                <th className="px-4 py-3 text-left">Días</th>
                <th className="px-4 py-3 text-left">Prioridad</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((p) => (
                <tr key={p.id ?? p.n} className="transition hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">{p.n}</td>
                  <td className="px-4 py-3 font-medium text-navy">
                    {p.nombre}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.rut}</td>
                  <td className="px-4 py-3 text-slate-600">{p.esp}</td>
                  <td className="px-4 py-3 text-slate-600">{p.dias}</td>
                  <td className="px-4 py-3">
                    <PrioBadge prio={p.prio} />
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge est={p.est} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onOpenDetalle(p)}
                      className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-navy hover:text-navy"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-navy">
          Pacientes por especialidad
        </h2>
        <p className="mb-4 text-xs text-slate-500">
          Distribución actual de la lista de espera
        </p>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <BarChart
              data={chartRows}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7EB"
                vertical={false}
              />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#475569" }} />
              <YAxis tick={{ fontSize: 12, fill: "#475569" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #E5E7EB",
                  fontSize: 12,
                }}
                cursor={{ fill: "rgba(15,45,90,0.05)" }}
              />
              <Bar dataKey="value" fill="#0F2D5A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-navy/35"
            onClick={() => setSelected(null)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {selected.codigoDerivacion}
                  </div>
                  <h3 className="mt-1 text-xl font-semibold text-navy">
                    {selected.paciente?.nombre || "Paciente sin nombre"}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <PrioBadge prio={normalizePriority(selected.prioridad)} />
                    <EstadoBadge est={selected.estado || "En espera"} />
                    {detailLoading && (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                        Actualizando datos...
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-navy hover:text-navy"
                  aria-label="Cerrar detalle"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="mb-3 text-sm font-semibold text-navy">
                    Datos del paciente
                  </div>
                  <dl className="space-y-3 text-sm">
                    <DetailItem label="RUT" value={selected.paciente?.rut} />
                    <DetailItem
                      label="Nacimiento"
                      value={formatDate(selected.paciente?.fechaNacimiento)}
                    />
                    <DetailItem
                      label="Teléfono"
                      value={selected.paciente?.telefono}
                    />
                    <DetailItem
                      label="Email"
                      value={selected.paciente?.email}
                    />
                  </dl>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="mb-3 text-sm font-semibold text-navy">
                    Derivación
                  </div>
                  <dl className="space-y-3 text-sm">
                    <DetailItem
                      label="Especialidad"
                      value={selected.especialidad}
                    />
                    <DetailItem
                      label="Establecimiento"
                      value={selected.establecimiento}
                    />
                    <DetailItem
                      label="Fecha ingreso"
                      value={formatDate(selected.fechaIngreso)}
                    />
                    <DetailItem
                      label="Días en espera"
                      value={`${selected.diasEspera ?? 0} días`}
                    />
                  </dl>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-navy">
                    Cita asociada
                  </div>
                  <span className="rounded-full bg-[#F4F7FB] px-2 py-1 text-xs font-semibold text-slate-600">
                    {selected.fechaCita ? "Con fecha asignada" : "Sin cita"}
                  </span>
                </div>
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <DetailItem
                    label="Fecha cita"
                    value={formatDate(selected.fechaCita)}
                  />
                  <DetailItem label="Hora cita" value={selected.horaCita} />
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 p-4">
                <div className="mb-3 text-sm font-semibold text-navy">
                  Gestión del registro
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Prioridad
                    </span>
                    <select
                      value={detailForm.prioridad}
                      onChange={(event) =>
                        setDetailForm((current) => ({
                          ...current,
                          prioridad: event.target
                            .value as ListaEsperaDetailForm["prioridad"],
                        }))
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
                    >
                      <option value="ALTA">ALTA</option>
                      <option value="MEDIA">MEDIA</option>
                      <option value="BAJA">BAJA</option>
                    </select>
                  </label>

                  <label className="text-sm">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Estado
                    </span>
                    <select
                      value={detailForm.estado}
                      onChange={(event) =>
                        setDetailForm((current) => ({
                          ...current,
                          estado: event.target
                            .value as ListaEsperaDetailForm["estado"],
                        }))
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
                    >
                      {estadosPaciente.map((estado) => (
                        <option key={estado} value={estado}>
                          {estado}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="mt-4 block text-sm">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Notas internas
                  </span>
                  <textarea
                    value={detailForm.notas}
                    onChange={(event) =>
                      setDetailForm((current) => ({
                        ...current,
                        notas: event.target.value,
                      }))
                    }
                    rows={5}
                    className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
                    placeholder="Seguimiento, coordinación con paciente, observaciones clínicas administrativas..."
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard?.writeText(selected.codigoDerivacion)
                }
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-navy hover:text-navy"
              >
                Copiar código
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-navy hover:text-navy"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={onGuardarDetalle}
                  disabled={detailSaving}
                  className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal/90 disabled:opacity-60"
                >
                  {detailSaving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function mapListaEsperaRow(
  item: ListaEsperaResponse,
  index: number,
): PatientRow {
  return {
    id: item.id,
    n: index + 1,
    nombre: item.paciente?.nombre || "Paciente sin nombre",
    rut: item.paciente?.rut || "Sin RUT",
    esp: item.especialidad,
    dias: item.diasEspera ?? 0,
    prio: normalizePriority(item.prioridad),
    est: item.estado || "En espera",
  };
}

function normalizePriority(value: string) {
  const normalized = value?.toUpperCase?.() || "MEDIA";
  if (["ALTA", "MEDIA", "BAJA"].includes(normalized)) return normalized;
  return "MEDIA";
}

function normalizeEstadoPaciente(
  value?: string | null,
): ListaEsperaDetailForm["estado"] {
  const estado = estadosPaciente.find((item) => item === value);
  return estado ?? "En espera";
}

function buildListaEsperaDetailForm(
  item: ListaEsperaResponse,
): ListaEsperaDetailForm {
  return {
    prioridad: normalizePriority(
      item.prioridad,
    ) as ListaEsperaDetailForm["prioridad"],
    estado: normalizeEstadoPaciente(item.estado),
    notas: item.notas ?? "",
  };
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-slate-700">
        {value || "No registrado"}
      </dd>
    </div>
  );
}

/* ---------- Agenda de Citas ---------- */

const citas = [
  {
    hora: "08:30",
    paciente: "María González Torres",
    esp: "Traumatología",
    box: "Box 3",
    medico: "Dr. Ramírez",
    estado: "Confirmada",
  },
  {
    hora: "09:00",
    paciente: "Carlos Rojas Mendoza",
    esp: "Cardiología",
    box: "Box 1",
    medico: "Dra. Salinas",
    estado: "Confirmada",
  },
  {
    hora: "09:30",
    paciente: "Ana Soto Pérez",
    esp: "Neurología",
    box: "Box 5",
    medico: "Dr. Tapia",
    estado: "Pendiente",
  },
  {
    hora: "10:00",
    paciente: "Pedro Muñoz Silva",
    esp: "Oftalmología",
    box: "Box 2",
    medico: "Dra. Bravo",
    estado: "Confirmada",
  },
  {
    hora: "10:30",
    paciente: "—",
    esp: "Cardiología",
    box: "Box 1",
    medico: "Dra. Salinas",
    estado: "Cupo libre",
  },
  {
    hora: "11:00",
    paciente: "Isabel Fuentes Castro",
    esp: "Medicina Interna",
    box: "Box 4",
    medico: "Dr. Pizarro",
    estado: "Confirmada",
  },
  {
    hora: "11:30",
    paciente: "Roberto Díaz Herrera",
    esp: "Cardiología",
    box: "Box 1",
    medico: "Dra. Salinas",
    estado: "Cancelada",
  },
  {
    hora: "12:00",
    paciente: "Carmen Vidal Ramos",
    esp: "Traumatología",
    box: "Box 3",
    medico: "Dr. Ramírez",
    estado: "Confirmada",
  },
];

function AgendaCitas() {
  const [agenda, setAgenda] = useState<AgendaResponse | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [gestionCupoId, setGestionCupoId] = useState<string | null>(null);
  const [gestionSugerencias, setGestionSugerencias] = useState<
    SugerenciaReasignacionResponse[]
  >([]);
  const [motivoCancelacion, setMotivoCancelacion] = useState("Cancelación");
  const [notaGestion, setNotaGestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gestionLoading, setGestionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<NuevaCitaRequest>({
    nombre: "",
    rut: "",
    email: "",
    telefono: "",
    especialidad: "Cardiologia",
    establecimiento: establecimientosNorte[3],
    fechaCupo: new Date().toISOString().slice(0, 10),
    horaCupo: "09:00",
    medico: "",
    prioridad: "MEDIA",
    notas: "",
  });

  async function loadAgenda() {
    setLoading(true);
    setError(null);
    try {
      setAgenda(await api.getAgenda());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No fue posible cargar la agenda",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAgenda();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await api.crearCita(form);
      setMessage("Cita creada y guardada en la base de datos.");
      setShowForm(false);
      setForm((current) => ({
        ...current,
        nombre: "",
        rut: "",
        email: "",
        telefono: "",
        medico: "",
        notas: "",
      }));
      await loadAgenda();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No fue posible crear la cita",
      );
    } finally {
      setSaving(false);
    }
  };

  const onGestionar = async (cupo: CupoResponse) => {
    if (gestionCupoId === cupo.id) {
      setGestionCupoId(null);
      setGestionSugerencias([]);
      return;
    }

    setGestionCupoId(cupo.id);
    setGestionLoading(true);
    setError(null);
    setMessage(null);
    try {
      setGestionSugerencias(await api.getSugerenciasCupo(cupo.id));
    } catch (err) {
      setGestionSugerencias([]);
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible cargar sugerencias para el cupo",
      );
    } finally {
      setGestionLoading(false);
    }
  };

  const onCancelarCupo = async (cupo: CupoResponse) => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await api.cancelarCupo(cupo.id, motivoCancelacion);
      setMessage("Cita cancelada. El paciente vuelve a lista de espera.");
      await loadAgenda();
      setGestionSugerencias(await api.getSugerenciasCupo(cupo.id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No fue posible cancelar la cita",
      );
    } finally {
      setSaving(false);
    }
  };

  const onReasignarManual = async (
    cupo: CupoResponse,
    listaEsperaId: string,
  ) => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await api.asignarCupo(cupo.id, listaEsperaId);
      setMessage("Cupo reasignado manualmente.");
      setGestionCupoId(null);
      setGestionSugerencias([]);
      await loadAgenda();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No fue posible reasignar el cupo",
      );
    } finally {
      setSaving(false);
    }
  };

  const onAccionCita = async (
    cupo: CupoResponse,
    accion: "confirmar" | "atendida" | "no-asistio",
  ) => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      if (accion === "confirmar") {
        await api.confirmarCupo(cupo.id, notaGestion || "Cita confirmada");
        setMessage("Cita confirmada correctamente.");
      }
      if (accion === "atendida") {
        await api.marcarAtendida(cupo.id, notaGestion || "Paciente atendido");
        setMessage("Paciente marcado como atendido.");
      }
      if (accion === "no-asistio") {
        await api.marcarNoAsistio(
          cupo.id,
          notaGestion || "Paciente no asistio",
        );
        setMessage("Inasistencia registrada. El cupo queda para reasignacion.");
      }
      setNotaGestion("");
      await loadAgenda();
      setGestionSugerencias(await api.getSugerenciasCupo(cupo.id));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible actualizar la cita",
      );
    } finally {
      setSaving(false);
    }
  };

  const citasAgenda = agenda?.citas ?? [];
  const metricas = agenda?.metricas;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Citas de hoy"
          value={String(metricas?.citas ?? citasAgenda.length)}
          icon={Calendar}
          color="text-navy bg-navy/10"
          trend="Desde agenda real"
        />
        <Kpi
          label="Confirmadas"
          value={String(metricas?.confirmadas ?? 0)}
          icon={CheckCircle2}
          color="text-[#2E7D32] bg-[#2E7D32]/10"
          trend="Cupos ocupados"
        />
        <Kpi
          label="Pendientes"
          value={String(metricas?.pendientes ?? 0)}
          icon={Clock}
          color="text-[#E65100] bg-[#E65100]/10"
          trend="Cupos disponibles"
        />
        <Kpi
          label="Canceladas"
          value={String(metricas?.canceladas ?? 0)}
          icon={AlertTriangle}
          color="text-[#C62828] bg-[#C62828]/10"
          trend="Reasignables"
        />
      </div>

      {message && (
        <div className="rounded-lg border border-[#2E7D32]/20 bg-[#2E7D32]/5 p-4 text-sm text-[#2E7D32]">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-[#C62828]/20 bg-[#C62828]/5 p-4 text-sm text-[#C62828]">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-navy">
              Agenda — Próximas citas
            </h2>
            <p className="text-xs text-slate-500">Vista cronológica del día</p>
          </div>
          <div className="flex gap-2">
            <select className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700">
              <option>Todas las especialidades</option>
              <option>Cardiología</option>
              <option>Traumatología</option>
              <option>Neurología</option>
            </select>
            <button
              onClick={() => setShowForm((value) => !value)}
              className="rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy/90"
            >
              {showForm ? "Cerrar" : "+ Nueva cita"}
            </button>
          </div>
        </div>

        {showForm && (
          <form
            onSubmit={onCreate}
            className="grid grid-cols-1 gap-3 border-b border-slate-200 bg-[#F4F7FB] px-5 py-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre paciente"
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <input
              value={form.rut}
              onChange={(e) => setForm({ ...form, rut: e.target.value })}
              placeholder="RUT"
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <input
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="Telefono"
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <select
              value={form.especialidad}
              onChange={(e) =>
                setForm({ ...form, especialidad: e.target.value })
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
            >
              <option>Cardiologia</option>
              <option>Traumatologia</option>
              <option>Neurologia</option>
              <option>Oftalmologia</option>
              <option>Medicina Interna</option>
            </select>
            <select
              value={form.establecimiento}
              onChange={(e) =>
                setForm({ ...form, establecimiento: e.target.value })
              }
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
            >
              {establecimientosNorte.map((establecimiento) => (
                <option key={establecimiento} value={establecimiento}>
                  {establecimiento}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={form.fechaCupo}
              onChange={(e) => setForm({ ...form, fechaCupo: e.target.value })}
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <input
              type="time"
              value={form.horaCupo}
              onChange={(e) => setForm({ ...form, horaCupo: e.target.value })}
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <input
              value={form.medico}
              onChange={(e) => setForm({ ...form, medico: e.target.value })}
              placeholder="Medico"
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <select
              value={form.prioridad}
              onChange={(e) =>
                setForm({
                  ...form,
                  prioridad: e.target.value as NuevaCitaRequest["prioridad"],
                })
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
            >
              <option value="ALTA">ALTA</option>
              <option value="MEDIA">MEDIA</option>
              <option value="BAJA">BAJA</option>
            </select>
            <input
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              placeholder="Notas"
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs lg:col-span-2"
            />
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-teal px-3 py-2 text-xs font-semibold text-white hover:bg-teal/90 disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar cita"}
            </button>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#F4F7FB] text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Hora</th>
                <th className="px-4 py-3 text-left">Paciente</th>
                <th className="px-4 py-3 text-left">Especialidad</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Médico</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={7}>
                    Cargando agenda...
                  </td>
                </tr>
              )}
              {!loading &&
                citasAgenda.map((c, i) => (
                  <Fragment key={c.id ?? i}>
                    <tr className="transition hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-semibold text-navy">
                        {formatTime(c.horaCupo)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {c.listaEspera?.paciente?.nombre || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {c.especialidad}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(c.fechaCupo)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {c.medico || "Sin medico"}
                      </td>
                      <td className="px-4 py-3">
                        <CitaBadge estado={toCitaEstado(c)} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onGestionar(c)}
                          className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-navy hover:text-navy"
                        >
                          {gestionCupoId === c.id ? "Cerrar" : "Gestionar"}
                        </button>
                      </td>
                    </tr>
                    {gestionCupoId === c.id && (
                      <tr>
                        <td colSpan={7} className="bg-[#F4F7FB] px-5 py-4">
                          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(220px,280px)_1fr]">
                            <div className="rounded-lg border border-slate-200 bg-white p-4">
                              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Estado de la cita
                              </div>
                              <p className="mt-1 text-xs text-slate-500">
                                Actualiza el resultado operativo de la atención.
                              </p>
                              <input
                                value={notaGestion}
                                onChange={(e) => setNotaGestion(e.target.value)}
                                placeholder="Nota operativa"
                                className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                              />
                              <div className="mt-3 grid grid-cols-1 gap-2">
                                <button
                                  onClick={() => onAccionCita(c, "confirmar")}
                                  disabled={
                                    saving ||
                                    c.estado === "Cancelado" ||
                                    !c.listaEsperaId
                                  }
                                  className="rounded-lg bg-teal px-3 py-2 text-xs font-semibold text-white hover:bg-teal/90 disabled:opacity-60"
                                >
                                  Confirmar cita
                                </button>
                                <button
                                  onClick={() => onAccionCita(c, "atendida")}
                                  disabled={
                                    saving ||
                                    c.estado === "Cancelado" ||
                                    !c.listaEsperaId
                                  }
                                  className="rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-navy/90 disabled:opacity-60"
                                >
                                  Marcar atendida
                                </button>
                                <button
                                  onClick={() => onAccionCita(c, "no-asistio")}
                                  disabled={
                                    saving ||
                                    c.estado === "Cancelado" ||
                                    !c.listaEsperaId
                                  }
                                  className="rounded-lg border border-[#E65100]/30 px-3 py-2 text-xs font-semibold text-[#E65100] hover:bg-[#E65100]/5 disabled:opacity-60"
                                >
                                  No asistió
                                </button>
                              </div>

                              <div className="mt-4 border-t border-slate-100 pt-4">
                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Cancelar cita
                                </div>
                                <p className="mt-1 text-xs text-slate-500">
                                  Libera el cupo y devuelve al paciente actual a
                                  lista de espera.
                                </p>
                                <input
                                  value={motivoCancelacion}
                                  onChange={(e) =>
                                    setMotivoCancelacion(e.target.value)
                                  }
                                  placeholder="Motivo"
                                  className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                                />
                                <button
                                  onClick={() => onCancelarCupo(c)}
                                  disabled={saving || c.estado === "Cancelado"}
                                  className="mt-3 w-full rounded-lg bg-[#C62828] px-3 py-2 text-xs font-semibold text-white hover:bg-[#C62828]/90 disabled:opacity-60"
                                >
                                  {saving ? "Procesando..." : "Cancelar cita"}
                                </button>
                              </div>
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-white p-4">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Reasignar manualmente
                                  </div>
                                  <p className="mt-1 text-xs text-slate-500">
                                    Pacientes compatibles por especialidad,
                                    prioridad y días de espera.
                                  </p>
                                </div>
                                <button
                                  onClick={() => onGestionar(c)}
                                  className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-navy hover:text-navy"
                                >
                                  Actualizar
                                </button>
                              </div>

                              <div className="mt-3 overflow-x-auto">
                                <table className="min-w-full text-xs">
                                  <thead className="text-left uppercase tracking-wide text-slate-500">
                                    <tr>
                                      <th className="py-2 pr-3">Paciente</th>
                                      <th className="py-2 pr-3">RUT</th>
                                      <th className="py-2 pr-3">Días</th>
                                      <th className="py-2 pr-3">Prioridad</th>
                                      <th className="py-2 pr-3">Match</th>
                                      <th className="py-2 text-right">
                                        Acción
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {gestionLoading && (
                                      <tr>
                                        <td
                                          className="py-3 text-slate-500"
                                          colSpan={6}
                                        >
                                          Cargando sugerencias...
                                        </td>
                                      </tr>
                                    )}
                                    {!gestionLoading &&
                                      gestionSugerencias.map((s) => (
                                        <tr key={s.listaEsperaId}>
                                          <td className="py-2 pr-3 font-medium text-navy">
                                            {s.paciente}
                                          </td>
                                          <td className="py-2 pr-3 text-slate-600">
                                            {s.rut}
                                          </td>
                                          <td className="py-2 pr-3 text-slate-600">
                                            {s.diasEspera}
                                          </td>
                                          <td className="py-2 pr-3">
                                            <PrioBadge
                                              prio={normalizePriority(
                                                s.prioridad,
                                              )}
                                            />
                                          </td>
                                          <td className="py-2 pr-3">
                                            <span className="rounded-full bg-teal/10 px-2 py-0.5 font-semibold text-teal">
                                              {s.match}%
                                            </span>
                                          </td>
                                          <td className="py-2 text-right">
                                            <button
                                              onClick={() =>
                                                onReasignarManual(
                                                  c,
                                                  s.listaEsperaId,
                                                )
                                              }
                                              disabled={saving}
                                              className="rounded-md bg-navy px-2.5 py-1 font-semibold text-white hover:bg-navy/90 disabled:opacity-60"
                                            >
                                              Asignar
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    {!gestionLoading &&
                                      gestionSugerencias.length === 0 && (
                                        <tr>
                                          <td
                                            className="py-3 text-slate-500"
                                            colSpan={6}
                                          >
                                            No hay pacientes compatibles para
                                            este cupo.
                                          </td>
                                        </tr>
                                      )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              {!loading && citasAgenda.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={7}>
                    No hay citas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function formatTime(value?: string | null) {
  return value ? value.slice(0, 5) : "--:--";
}

function formatDate(value?: string | null) {
  if (!value) return "Sin fecha";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function toCitaEstado(cupo: CupoResponse) {
  if (cupo.estado === "Ocupado") return "Confirmada";
  if (cupo.estado === "Cancelado") return "Cancelada";
  if (cupo.estado === "Disponible") return "Cupo libre";
  return "Pendiente";
}

function CitaBadge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    Confirmada: "bg-[#2E7D32]/10 text-[#2E7D32]",
    Pendiente: "bg-[#E65100]/10 text-[#E65100]",
    Cancelada: "bg-[#C62828]/10 text-[#C62828]",
    "Cupo libre": "bg-teal/10 text-teal",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[estado] ?? "bg-slate-100 text-slate-700"}`}
    >
      {estado}
    </span>
  );
}

/* ---------- Reasignación de Cupos ---------- */

const cuposLibres = [
  {
    hora: "10:30",
    esp: "Cardiología",
    medico: "Dra. Salinas",
    motivo: "Cancelación",
  },
  {
    hora: "11:30",
    esp: "Cardiología",
    medico: "Dra. Salinas",
    motivo: "No asistió",
  },
  {
    hora: "15:00",
    esp: "Traumatología",
    medico: "Dr. Ramírez",
    motivo: "Cancelación",
  },
];

const sugerencias = [
  {
    paciente: "Roberto Díaz Herrera",
    rut: "14.765.432-1",
    esp: "Cardiología",
    dias: 42,
    prio: "ALTA",
    match: "98%",
  },
  {
    paciente: "Carlos Rojas Mendoza",
    rut: "15.234.567-8",
    esp: "Cardiología",
    dias: 143,
    prio: "ALTA",
    match: "95%",
  },
  {
    paciente: "María González Torres",
    rut: "12.345.678-9",
    esp: "Traumatología",
    dias: 187,
    prio: "ALTA",
    match: "97%",
  },
];

function ReasignacionCupos() {
  const [data, setData] = useState<ReasignacionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadReasignacion() {
    setLoading(true);
    setError(null);
    try {
      setData(await api.getReasignacion());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible cargar reasignaciones",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReasignacion();
  }, []);

  const onReasignarTodos = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const asignados = await api.reasignarAutomaticamente();
      setMessage(`${asignados.length} cupos reasignados correctamente.`);
      await loadReasignacion();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible reasignar los cupos",
      );
    } finally {
      setSaving(false);
    }
  };

  const onAsignar = async (listaEsperaId: string, especialidad: string) => {
    const cupo = data?.cupos.find((item) => item.especialidad === especialidad);
    if (!cupo) {
      setError("No hay cupos compatibles para esta especialidad.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await api.asignarCupo(cupo.id, listaEsperaId);
      setMessage("Cupo asignado correctamente.");
      await loadReasignacion();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible asignar");
    } finally {
      setSaving(false);
    }
  };

  const cupos = data?.cupos ?? [];
  const sugerenciasData = data?.sugerencias ?? [];

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi
          label="Cupos liberados hoy"
          value={String(data?.cuposLiberados ?? cupos.length)}
          icon={RefreshCw}
          color="text-teal bg-teal/10"
          trend="Disponibles para reasignar"
        />
        <Kpi
          label="Reasignaciones automáticas"
          value={String(data?.reasignacionesAutomaticas ?? 0)}
          icon={Zap}
          color="text-navy bg-navy/10"
          trend="Cupos ocupados"
        />
        <Kpi
          label="Tasa de recuperación"
          value={`${data?.tasaRecuperacion ?? 0}%`}
          icon={TrendingUp}
          color="text-[#2E7D32] bg-[#2E7D32]/10"
          trend="Meta: 80%"
        />
      </div>

      {message && (
        <div className="rounded-lg border border-[#2E7D32]/20 bg-[#2E7D32]/5 p-4 text-sm text-[#2E7D32]">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-[#C62828]/20 bg-[#C62828]/5 p-4 text-sm text-[#C62828]">
          {error}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-navy">
              Cupos libres por reasignar
            </h2>
            <p className="text-xs text-slate-500">
              Detectados en la agenda de hoy
            </p>
          </div>
          <button
            onClick={onReasignarTodos}
            disabled={saving || loading}
            className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal/90 disabled:opacity-60"
          >
            {saving ? "Reasignando..." : "Reasignar todos"}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {loading && (
            <div className="rounded-lg border border-slate-200 bg-[#F4F7FB] p-4 text-sm text-slate-500">
              Cargando cupos...
            </div>
          )}
          {!loading &&
            cupos.map((c, i) => (
              <div
                key={c.id ?? i}
                className="rounded-lg border border-slate-200 bg-[#F4F7FB] p-4"
              >
                <div className="text-2xl font-bold text-navy">
                  {formatTime(c.horaCupo)}
                </div>
                <div className="text-sm font-medium text-slate-700">
                  {c.especialidad}
                </div>
                <div className="text-xs text-slate-500">
                  {c.medico || c.establecimiento}
                </div>
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#E65100]/10 px-2 py-0.5 text-[10px] font-semibold text-[#E65100]">
                  {c.motivoCancelacion || c.estado}
                </div>
              </div>
            ))}
          {!loading && cupos.length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-[#F4F7FB] p-4 text-sm text-slate-500">
              No hay cupos libres para reasignar.
            </div>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-navy">
            Pacientes sugeridos por el algoritmo
          </h2>
          <p className="text-xs text-slate-500">
            Ordenados por prioridad clínica y tiempo de espera
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#F4F7FB] text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Paciente</th>
                <th className="px-4 py-3 text-left">RUT</th>
                <th className="px-4 py-3 text-left">Especialidad</th>
                <th className="px-4 py-3 text-left">Días esperando</th>
                <th className="px-4 py-3 text-left">Prioridad</th>
                <th className="px-4 py-3 text-left">Match</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sugerenciasData.map((s, i) => (
                <tr
                  key={s.listaEsperaId ?? i}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-navy">
                    {s.paciente}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.rut}</td>
                  <td className="px-4 py-3 text-slate-600">{s.especialidad}</td>
                  <td className="px-4 py-3 text-slate-600">{s.diasEspera}</td>
                  <td className="px-4 py-3">
                    <PrioBadge prio={normalizePriority(s.prioridad)} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-teal/10 px-2.5 py-0.5 text-xs font-semibold text-teal">
                      {s.match}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onAsignar(s.listaEsperaId, s.especialidad)}
                      disabled={saving}
                      className="inline-flex items-center gap-1 rounded-md bg-navy px-3 py-1 text-xs font-semibold text-white hover:bg-navy/90 disabled:opacity-60"
                    >
                      Asignar <ArrowRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && sugerenciasData.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={7}>
                    No hay sugerencias disponibles para los cupos actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

/* ---------- Reportes ---------- */

const tendencia = [
  { mes: "Ene", espera: 5.1, meta: 2.9 },
  { mes: "Feb", espera: 4.9, meta: 2.9 },
  { mes: "Mar", espera: 4.7, meta: 2.9 },
  { mes: "Abr", espera: 4.5, meta: 2.9 },
  { mes: "May", espera: 4.3, meta: 2.9 },
  { mes: "Jun", espera: 4.2, meta: 2.9 },
];

const distribucionPrio = [
  { name: "Alta", value: 98, color: "#C62828" },
  { name: "Media", value: 134, color: "#E65100" },
  { name: "Baja", value: 80, color: "#2E7D32" },
];

function Reportes() {
  const [data, setData] = useState<ReporteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadReportes() {
      try {
        const reportes = await api.getReportes();
        if (active) setData(reportes);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "No fue posible cargar reportes",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadReportes();
    return () => {
      active = false;
    };
  }, []);

  const tendenciaRows = data?.tendenciaEspera ?? tendencia;
  const prioridadRows = data?.distribucionPrioridad ?? distribucionPrio;

  return (
    <>
      <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-semibold text-navy">
            Reportes y Estadísticas
          </h2>
          <p className="text-xs text-slate-500">
            Informes consolidados para gestión interna y MINSAL
          </p>
        </div>
        <div className="flex gap-2">
          <select className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700">
            <option>Último mes</option>
            <option>Últimos 3 meses</option>
            <option>Año en curso</option>
          </select>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-navy/90">
            <Download className="h-3.5 w-3.5" /> Exportar PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-[#C62828]/20 bg-[#C62828]/5 p-4 text-sm text-[#C62828]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Pacientes atendidos (mes)"
          value={loading ? "..." : String(data?.pacientesAtendidosMes ?? 0)}
          icon={CheckCircle2}
          color="text-[#2E7D32] bg-[#2E7D32]/10"
          trend="Calculado desde lista"
        />
        <Kpi
          label="Cupos reasignados (mes)"
          value={loading ? "..." : String(data?.cuposReasignadosMes ?? 0)}
          icon={RefreshCw}
          color="text-teal bg-teal/10"
          trend="Cupos ocupados"
        />
        <Kpi
          label="Tiempo promedio espera"
          value={
            loading
              ? "..."
              : `${String(data?.tiempoPromedioEspera ?? 0).replace(".", ",")} meses`
          }
          icon={Clock}
          color="text-[#E65100] bg-[#E65100]/10"
          trend="Promedio actual"
        />
        <Kpi
          label="Cumplimiento GES"
          value={
            loading
              ? "..."
              : `${String(data?.cumplimientoGes ?? 0).replace(".", ",")}%`
          }
          icon={Shield}
          color="text-navy bg-navy/10"
          trend="Meta MINSAL: 95%"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-navy">
            Evolución del tiempo de espera
          </h3>
          <p className="mb-4 text-xs text-slate-500">
            Meses promedio — últimos 6 meses
          </p>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart
                data={tendenciaRows}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  vertical={false}
                />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#475569" }} />
                <YAxis tick={{ fontSize: 12, fill: "#475569" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="espera"
                  stroke="#0F2D5A"
                  strokeWidth={2.5}
                  name="Espera real"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="meta"
                  stroke="#00838F"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Meta"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-navy">
            Distribución por prioridad
          </h3>
          <p className="mb-4 text-xs text-slate-500">Lista de espera actual</p>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={prioridadRows}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label={{ fontSize: 12 }}
                >
                  {prioridadRows.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-sm font-semibold text-navy">
            Informes disponibles
          </h3>
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-[#F4F7FB] text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Informe</th>
              <th className="px-4 py-3 text-left">Periodo</th>
              <th className="px-4 py-3 text-left">Generado</th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              ["Informe mensual MINSAL", "Mayo 2026", "01/06/2026"],
              ["Reporte de cumplimiento GES", "Trimestre 2", "15/06/2026"],
              [
                "Análisis de cupos reasignados",
                "Últimos 30 días",
                "17/06/2026",
              ],
              ["Lista de espera consolidada", "Junio 2026", "18/06/2026"],
            ].map((r) => (
              <tr key={r[0]} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-navy">{r[0]}</td>
                <td className="px-4 py-3 text-slate-600">{r[1]}</td>
                <td className="px-4 py-3 text-slate-600">{r[2]}</td>
                <td className="px-4 py-3 text-right">
                  <button className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-navy hover:text-navy">
                    <Download className="h-3 w-3" /> Descargar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

/* ---------- Mi Perfil ---------- */

function MiPerfil() {
  const [perfil, setPerfil] = useState<UsuarioPerfilResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadPerfil() {
      try {
        const data = await api.getPerfil();
        if (active) setPerfil(data);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "No fue posible cargar perfil",
          );
        }
      }
    }
    loadPerfil();
    return () => {
      active = false;
    };
  }, []);

  const nombre = perfil?.nombre || "Dr. Daniel Carrasco";
  const cargo = perfil?.cargo || "Director del Servicio";
  const unidad = perfil?.unidad || "Dirección — Hospital Regional del Norte";
  const establecimiento =
    perfil?.establecimiento || "Hospital Regional del Norte, Antofagasta";
  const iniciales = nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <>
      {error && (
        <div className="rounded-lg border border-[#C62828]/20 bg-[#C62828]/5 p-4 text-sm text-[#C62828]">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="h-28 bg-gradient-to-r from-navy to-teal" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex items-end gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-teal text-2xl font-bold text-white shadow-md">
              {iniciales || "RF"}
            </div>
            <div className="pb-2">
              <h2 className="text-xl font-bold text-navy">{nombre}</h2>
              <p className="text-sm text-slate-600">
                {cargo} · {establecimiento}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-semibold text-navy">Datos personales</h3>
          <p className="mb-4 text-xs text-slate-500">
            Información de tu cuenta
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo label="Nombre completo" value={nombre} />
            <Campo label="RUT" value="9.876.543-2" />
            <Campo label="Cargo" value={cargo} />
            <Campo label="Unidad" value={unidad} />
            <Campo
              label="Correo institucional"
              value={perfil?.email || "admin@rednorte.cl"}
              icon={Mail}
            />
            <Campo
              label="Teléfono"
              value={perfil?.telefono || "+56 9 8765 4321"}
              icon={Phone}
            />
            <Campo
              label="Establecimiento"
              value={establecimiento}
              icon={MapPin}
            />
            <Campo
              label="Último acceso"
              value={
                perfil?.ultimoAcceso
                  ? new Date(perfil.ultimoAcceso).toLocaleString("es-CL")
                  : "Hoy"
              }
              icon={Clock}
            />
          </div>
          <div className="mt-5 flex gap-2">
            <button className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90">
              Editar datos
            </button>
            <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cambiar contraseña
            </button>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-navy">Permisos y rol</h3>
            <div className="mt-3 space-y-2 text-sm">
              {(
                perfil?.permisos || [
                  "Gestion de lista de espera",
                  "Reasignacion de cupos",
                  "Reportes y exportaciones",
                  "Administracion de usuarios",
                ]
              ).map((p) => (
                <div key={p} className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-[#2E7D32]" /> {p}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-navy">Preferencias</h3>
            <div className="mt-3 space-y-3 text-sm">
              <Toggle label="Notificaciones por correo" on />
              <Toggle label="Alertas de cupos libres" on />
              <Toggle label="Resumen diario" />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function Campo({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Mail;
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 flex items-center gap-2 text-sm text-navy">
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        {value}
      </div>
    </div>
  );
}

function Toggle({ label, on }: { label: string; on?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-700">{label}</span>
      <span
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${on ? "bg-teal" : "bg-slate-300"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${on ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </span>
    </div>
  );
}

/* ---------- Shared ---------- */

function Kpi({
  label,
  value,
  icon: Icon,
  color,
  trend,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </div>
          <div className="mt-1 text-2xl font-bold text-navy">{value}</div>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 text-xs text-slate-500">{trend}</div>
    </div>
  );
}

function PrioBadge({ prio }: { prio: string }) {
  const map: Record<string, string> = {
    ALTA: "bg-[#C62828]/10 text-[#C62828]",
    MEDIA: "bg-[#E65100]/10 text-[#E65100]",
    BAJA: "bg-[#2E7D32]/10 text-[#2E7D32]",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[prio]}`}
    >
      {prio}
    </span>
  );
}

function EstadoBadge({ est }: { est: string }) {
  const map: Record<string, string> = {
    "En espera": "bg-slate-100 text-slate-700",
    Urgente: "bg-[#C62828]/10 text-[#C62828]",
    Citado: "bg-[#2E7D32]/10 text-[#2E7D32]",
    Atendido: "bg-navy/10 text-navy",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[est] ?? "bg-slate-100 text-slate-700"}`}
    >
      {est}
    </span>
  );
}

/* shim to keep Shield icon import used */
import { Shield } from "lucide-react";
