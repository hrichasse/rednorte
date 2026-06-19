const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
};

export type AuthResponse = {
  token: string;
  email: string;
  nombre: string;
  rol: string;
  expiresIn: number;
};

export type RegisterRequest = {
  nombre: string;
  email: string;
  password: string;
  establecimiento: string;
  rol: "MEDICO" | "ADMINISTRATIVO";
};

export type PacienteResponse = {
  id: string;
  nombre: string;
  rut: string;
  email?: string | null;
  telefono?: string | null;
  fechaNacimiento?: string | null;
};

export type ListaEsperaResponse = {
  id: string;
  codigoDerivacion: string;
  especialidad: string;
  establecimiento: string;
  prioridad: string;
  estado: string;
  diasEspera: number;
  fechaIngreso?: string | null;
  fechaCita?: string | null;
  horaCita?: string | null;
  notas?: string | null;
  paciente?: PacienteResponse | null;
};

export type ActualizarListaEsperaRequest = {
  prioridad?: "ALTA" | "MEDIA" | "BAJA";
  estado?: "En espera" | "Citado" | "Urgente" | "Atendido";
  notas?: string;
};

export type EstadisticasResponse = {
  totalPacientes: number;
  porEstado: Record<string, number>;
  porEspecialidad: Record<string, number>;
  porPrioridad?: Record<string, number>;
  cuposDisponibles?: number;
  cuposOcupados?: number;
  cuposCancelados: number;
  reasignacionesMes?: number;
  tiempoPromedioEspera: number;
  enEspera?: number;
};

export type CupoResponse = {
  id: string;
  especialidad: string;
  establecimiento: string;
  fechaCupo: string;
  horaCupo: string;
  medico?: string | null;
  estado: string;
  listaEsperaId?: string | null;
  motivoCancelacion?: string | null;
  listaEspera?: ListaEsperaResponse | null;
};

export type AgendaResponse = {
  metricas: {
    citas: number;
    confirmadas: number;
    pendientes: number;
    canceladas: number;
  };
  citas: CupoResponse[];
};

export type NuevaCitaRequest = {
  nombre: string;
  rut: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  especialidad: string;
  establecimiento: string;
  fechaCupo: string;
  horaCupo: string;
  medico?: string;
  prioridad: "ALTA" | "MEDIA" | "BAJA";
  notas?: string;
};

export type ReasignacionResponse = {
  cuposLiberados: number;
  reasignacionesAutomaticas: number;
  tasaRecuperacion: number;
  cupos: CupoResponse[];
  sugerencias: SugerenciaReasignacionResponse[];
};

export type SugerenciaReasignacionResponse = {
  listaEsperaId: string;
  paciente: string;
  rut: string;
  especialidad: string;
  diasEspera: number;
  prioridad: string;
  match: number;
};

export type ReporteResponse = {
  pacientesAtendidosMes: number;
  cuposReasignadosMes: number;
  tiempoPromedioEspera: number;
  cumplimientoGes: number;
  tendenciaEspera: { mes: string; espera: number; meta: number }[];
  distribucionPrioridad: { name: string; value: number; color: string }[];
};

export type UsuarioPerfilResponse = {
  nombre: string;
  email: string;
  rol: string;
  cargo: string;
  unidad: string;
  establecimiento: string;
  telefono: string;
  ultimoAcceso: string;
  permisos: string[];
};

function getAuthHeader(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("rednorte_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseResponse<T>(
  res: Response,
  fallbackMessage: string,
): Promise<T> {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "El backend no devolvio JSON. Verifica que Spring Boot este corriendo en http://localhost:8080 y que el frontend este en http://localhost:3000.",
    );
  }

  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok) throw new Error(json.message || fallbackMessage);
  return json.data;
}

export const api = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await parseResponse<AuthResponse>(
      res,
      "Error al iniciar sesion",
    );
    if (typeof window !== "undefined") {
      localStorage.setItem("rednorte_token", data.token);
    }
    return data;
  },

  register: async (request: RegisterRequest) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    const data = await parseResponse<AuthResponse>(
      res,
      "Error al registrar funcionario",
    );
    if (typeof window !== "undefined") {
      localStorage.setItem("rednorte_token", data.token);
    }
    return data;
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("rednorte_token");
    }
  },

  getPerfil: async () => {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return parseResponse<UsuarioPerfilResponse>(res, "Error al obtener perfil");
  },

  getListaEspera: async () => {
    const res = await fetch(`${API_URL}/api/lista-espera`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return parseResponse<ListaEsperaResponse[]>(res, "Error al obtener datos");
  },

  getListaEsperaDetalle: async (id: string) => {
    const res = await fetch(`${API_URL}/api/lista-espera/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return parseResponse<ListaEsperaResponse>(
      res,
      "Error al obtener detalle del paciente",
    );
  },

  actualizarListaEspera: async (
    id: string,
    request: ActualizarListaEsperaRequest,
  ) => {
    const res = await fetch(`${API_URL}/api/lista-espera/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(request),
    });
    return parseResponse<ListaEsperaResponse>(
      res,
      "Error al actualizar el registro",
    );
  },

  getEstadisticas: async () => {
    const res = await fetch(`${API_URL}/api/lista-espera/estadisticas`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return parseResponse<EstadisticasResponse>(
      res,
      "Error al obtener estadisticas",
    );
  },

  getAgenda: async () => {
    const res = await fetch(`${API_URL}/api/cupos/agenda`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return parseResponse<AgendaResponse>(res, "Error al obtener agenda");
  },

  crearCita: async (request: NuevaCitaRequest) => {
    const res = await fetch(`${API_URL}/api/cupos/citas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(request),
    });
    return parseResponse<CupoResponse>(res, "Error al crear cita");
  },

  getReasignacion: async () => {
    const res = await fetch(`${API_URL}/api/cupos/reasignacion`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return parseResponse<ReasignacionResponse>(
      res,
      "Error al obtener reasignaciones",
    );
  },

  asignarCupo: async (cupoId: string, listaEsperaId: string) => {
    const res = await fetch(`${API_URL}/api/cupos/${cupoId}/asignar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ listaEsperaId }),
    });
    return parseResponse<CupoResponse>(res, "Error al reasignar cupo");
  },

  getSugerenciasCupo: async (cupoId: string) => {
    const res = await fetch(`${API_URL}/api/cupos/${cupoId}/sugerencias`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return parseResponse<SugerenciaReasignacionResponse[]>(
      res,
      "Error al obtener sugerencias del cupo",
    );
  },

  cancelarCupo: async (cupoId: string, motivo: string) => {
    const res = await fetch(`${API_URL}/api/cupos/${cupoId}/cancelar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ motivo }),
    });
    return parseResponse<CupoResponse>(res, "Error al cancelar cupo");
  },

  confirmarCupo: async (cupoId: string, nota?: string) => {
    const res = await fetch(`${API_URL}/api/cupos/${cupoId}/confirmar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ nota }),
    });
    return parseResponse<CupoResponse>(res, "Error al confirmar cita");
  },

  marcarAtendida: async (cupoId: string, nota?: string) => {
    const res = await fetch(`${API_URL}/api/cupos/${cupoId}/atendida`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ nota }),
    });
    return parseResponse<CupoResponse>(res, "Error al marcar atendida");
  },

  marcarNoAsistio: async (cupoId: string, nota?: string) => {
    const res = await fetch(`${API_URL}/api/cupos/${cupoId}/no-asistio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ nota }),
    });
    return parseResponse<CupoResponse>(res, "Error al registrar inasistencia");
  },

  reasignarAutomaticamente: async () => {
    const res = await fetch(`${API_URL}/api/cupos/reasignacion/automatica`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return parseResponse<CupoResponse[]>(
      res,
      "Error al ejecutar reasignacion automatica",
    );
  },

  getReportes: async () => {
    const res = await fetch(`${API_URL}/api/cupos/reportes`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return parseResponse<ReporteResponse>(res, "Error al obtener reportes");
  },

  consultaPublica: async (rut: string, codigoDerivacion: string) => {
    const params = new URLSearchParams({ rut, codigoDerivacion });
    const res = await fetch(
      `${API_URL}/api/lista-espera/consulta-publica?${params}`,
    );
    return parseResponse<ListaEsperaResponse>(
      res,
      "No se encontraron resultados",
    );
  },

  consultaPaciente: async (rut: string, numeroSerie: string) => {
    const params = new URLSearchParams({ rut, numeroSerie });
    const res = await fetch(
      `${API_URL}/api/lista-espera/consulta-paciente?${params}`,
    );
    return parseResponse<ListaEsperaResponse[]>(
      res,
      "No se encontraron resultados",
    );
  },

  getCuposCancelados: async () => {
    const res = await fetch(`${API_URL}/api/cupos/cancelados/count`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return parseResponse<number>(res, "Error al obtener cupos cancelados");
  },
};
