package cl.rednorte.service;

import cl.rednorte.dto.request.AsignarCupoRequest;
import cl.rednorte.dto.request.CancelarCupoRequest;
import cl.rednorte.dto.request.GestionCupoRequest;
import cl.rednorte.dto.request.NuevaCitaRequest;
import cl.rednorte.dto.response.AgendaMetricasResponse;
import cl.rednorte.dto.response.AgendaResponse;
import cl.rednorte.dto.response.CupoResponse;
import cl.rednorte.dto.response.ReasignacionResponse;
import cl.rednorte.dto.response.ReporteResponse;
import cl.rednorte.dto.response.SugerenciaReasignacionResponse;
import cl.rednorte.exception.ResourceNotFoundException;
import cl.rednorte.model.CupoDisponible;
import cl.rednorte.model.ListaEspera;
import cl.rednorte.model.Paciente;
import cl.rednorte.model.enums.EstadoCupo;
import cl.rednorte.model.enums.EstadoPaciente;
import cl.rednorte.model.enums.Prioridad;
import cl.rednorte.repository.CuposRepository;
import cl.rednorte.repository.ListaEsperaRepository;
import cl.rednorte.repository.PacienteRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CuposService {

    private static final List<EstadoPaciente> ESTADOS_REASIGNABLES = List.of(
            EstadoPaciente.URGENTE,
            EstadoPaciente.EN_ESPERA
    );

    private final CuposRepository cuposRepository;
    private final PacienteRepository pacienteRepository;
    private final ListaEsperaRepository listaEsperaRepository;
    private final ListaEsperaService listaEsperaService;

    public List<CupoResponse> findDisponibles() {
        return cuposRepository.findByEstado(EstadoCupo.DISPONIBLE).stream()
                .map(this::toResponse)
                .toList();
    }

    public AgendaResponse getAgenda(LocalDate fecha) {
        List<CupoDisponible> cupos = fecha == null
                ? cuposRepository.findAllByOrderByFechaCupoAscHoraCupoAsc()
                : cuposRepository.findByFechaCupoOrderByHoraCupoAsc(fecha);

        return AgendaResponse.builder()
                .metricas(toAgendaMetricas(cupos))
                .citas(cupos.stream().map(this::toResponse).toList())
                .build();
    }

    @Transactional
    public CupoResponse crearCita(NuevaCitaRequest request) {
        Paciente paciente = pacienteRepository.findByRut(request.getRut())
                .map(existing -> actualizarPaciente(existing, request))
                .orElseGet(() -> crearPaciente(request));

        ListaEspera lista = ListaEspera.builder()
                .pacienteId(paciente.getId())
                .codigoDerivacion(generarCodigoDerivacion())
                .especialidad(request.getEspecialidad())
                .establecimiento(request.getEstablecimiento())
                .prioridad(parsePrioridad(request.getPrioridad()))
                .estado(EstadoPaciente.CITADO)
                .diasEspera(0)
                .fechaIngreso(LocalDate.now())
                .fechaCita(request.getFechaCupo())
                .horaCita(request.getHoraCupo())
                .notas(request.getNotas())
                .build();
        lista = listaEsperaRepository.save(lista);

        CupoDisponible cupo = CupoDisponible.builder()
                .especialidad(request.getEspecialidad())
                .establecimiento(request.getEstablecimiento())
                .fechaCupo(request.getFechaCupo())
                .horaCupo(request.getHoraCupo())
                .medico(request.getMedico())
                .estado(EstadoCupo.OCUPADO)
                .listaEsperaId(lista.getId())
                .build();

        return toResponse(cuposRepository.save(cupo));
    }

    public ReasignacionResponse getReasignacion() {
        List<CupoDisponible> cupos = cuposReasignables();
        List<SugerenciaReasignacionResponse> sugerencias = cupos.stream()
                .flatMap(cupo -> sugerenciasParaCupo(cupo).stream())
                .sorted(Comparator.comparing(SugerenciaReasignacionResponse::getMatch).reversed()
                        .thenComparing(SugerenciaReasignacionResponse::getDiasEspera, Comparator.reverseOrder()))
                .limit(10)
                .toList();

        long ocupados = cuposRepository.countByEstado(EstadoCupo.OCUPADO);
        long totalGestionados = ocupados + cuposRepository.countByEstado(EstadoCupo.CANCELADO);
        long tasa = totalGestionados == 0 ? 0 : Math.round((ocupados * 100.0) / totalGestionados);

        return ReasignacionResponse.builder()
                .cuposLiberados(cupos.size())
                .reasignacionesAutomaticas(ocupados)
                .tasaRecuperacion(tasa)
                .cupos(cupos.stream().map(this::toResponse).toList())
                .sugerencias(sugerencias)
                .build();
    }

    @Transactional
    public CupoResponse asignarCupo(UUID cupoId, AsignarCupoRequest request) {
        CupoDisponible cupo = cuposRepository.findById(cupoId)
                .orElseThrow(() -> new ResourceNotFoundException("Cupo no encontrado"));
        ListaEspera lista = listaEsperaRepository.findById(request.getListaEsperaId())
                .orElseThrow(() -> new ResourceNotFoundException("Paciente de lista de espera no encontrado"));

        liberarPacienteActual(cupo, "Cupo reasignado manualmente");
        validarAsignacion(cupo, lista);
        asignar(cupo, lista, "Cupo reasignado manualmente para " + cupo.getFechaCupo() + " " + cupo.getHoraCupo());
        return toResponse(cuposRepository.save(cupo));
    }

    public List<SugerenciaReasignacionResponse> sugerenciasParaCupo(UUID cupoId) {
        CupoDisponible cupo = cuposRepository.findById(cupoId)
                .orElseThrow(() -> new ResourceNotFoundException("Cupo no encontrado"));
        return sugerenciasParaCupo(cupo);
    }

    @Transactional
    public CupoResponse cancelarCupo(UUID cupoId, CancelarCupoRequest request) {
        CupoDisponible cupo = cuposRepository.findById(cupoId)
                .orElseThrow(() -> new ResourceNotFoundException("Cupo no encontrado"));

        liberarPacienteActual(cupo, "Cita cancelada: " + request.getMotivo());
        cupo.setEstado(EstadoCupo.CANCELADO);
        cupo.setListaEsperaId(null);
        cupo.setMotivoCancelacion(request.getMotivo());
        return toResponse(cuposRepository.save(cupo));
    }

    @Transactional
    public CupoResponse confirmarCupo(UUID cupoId, GestionCupoRequest request) {
        CupoDisponible cupo = cuposRepository.findById(cupoId)
                .orElseThrow(() -> new ResourceNotFoundException("Cupo no encontrado"));
        ListaEspera lista = pacienteAsignado(cupo);

        cupo.setEstado(EstadoCupo.OCUPADO);
        cupo.setMotivoCancelacion(null);
        lista.setEstado(EstadoPaciente.CITADO);
        lista.setFechaCita(cupo.getFechaCupo());
        lista.setHoraCita(cupo.getHoraCupo());
        lista.setNotas(appendNota(lista.getNotas(), nota(request, "Cita confirmada")));
        listaEsperaRepository.save(lista);
        return toResponse(cuposRepository.save(cupo));
    }

    @Transactional
    public CupoResponse marcarAtendida(UUID cupoId, GestionCupoRequest request) {
        CupoDisponible cupo = cuposRepository.findById(cupoId)
                .orElseThrow(() -> new ResourceNotFoundException("Cupo no encontrado"));
        ListaEspera lista = pacienteAsignado(cupo);

        cupo.setEstado(EstadoCupo.OCUPADO);
        cupo.setMotivoCancelacion(null);
        lista.setEstado(EstadoPaciente.ATENDIDO);
        lista.setFechaCita(cupo.getFechaCupo());
        lista.setHoraCita(cupo.getHoraCupo());
        lista.setNotas(appendNota(lista.getNotas(), nota(request, "Paciente atendido")));
        listaEsperaRepository.save(lista);
        return toResponse(cuposRepository.save(cupo));
    }

    @Transactional
    public CupoResponse marcarNoAsistio(UUID cupoId, GestionCupoRequest request) {
        CupoDisponible cupo = cuposRepository.findById(cupoId)
                .orElseThrow(() -> new ResourceNotFoundException("Cupo no encontrado"));

        String motivo = nota(request, "Paciente no asistio");
        liberarPacienteActual(cupo, motivo);
        cupo.setEstado(EstadoCupo.CANCELADO);
        cupo.setListaEsperaId(null);
        cupo.setMotivoCancelacion(motivo);
        return toResponse(cuposRepository.save(cupo));
    }

    @Transactional
    public List<CupoResponse> reasignarTodos() {
        List<CupoResponse> asignados = new ArrayList<>();
        for (CupoDisponible cupo : cuposReasignables()) {
            List<ListaEspera> candidatos = candidatosParaCupo(cupo);
            if (candidatos.isEmpty()) {
                continue;
            }
            asignar(cupo, candidatos.get(0), "Cupo reasignado automaticamente para " + cupo.getFechaCupo() + " " + cupo.getHoraCupo());
            asignados.add(toResponse(cuposRepository.save(cupo)));
        }
        return asignados;
    }

    public ReporteResponse getReportes() {
        List<ListaEspera> registros = listaEsperaRepository.findAll();
        double promedioMeses = promedioMeses(registros);
        long atendidos = registros.stream().filter(item -> item.getEstado() == EstadoPaciente.ATENDIDO).count();
        long reasignados = cuposRepository.countByEstadoAndListaEsperaIdIsNotNull(EstadoCupo.OCUPADO);
        long total = registros.size();
        long citadosOAtendidos = registros.stream()
                .filter(item -> item.getEstado() == EstadoPaciente.CITADO || item.getEstado() == EstadoPaciente.ATENDIDO)
                .count();
        double cumplimientoGes = total == 0 ? 0.0 : BigDecimal.valueOf((citadosOAtendidos * 100.0) / total)
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();

        return ReporteResponse.builder()
                .pacientesAtendidosMes(atendidos)
                .cuposReasignadosMes(reasignados)
                .tiempoPromedioEspera(promedioMeses)
                .cumplimientoGes(cumplimientoGes)
                .tendenciaEspera(tendencia(promedioMeses))
                .distribucionPrioridad(distribucionPrioridad())
                .build();
    }

    public long countCancelados() {
        return cuposRepository.countByEstado(EstadoCupo.CANCELADO);
    }

    private AgendaMetricasResponse toAgendaMetricas(List<CupoDisponible> cupos) {
        return AgendaMetricasResponse.builder()
                .citas(cupos.size())
                .confirmadas(cupos.stream().filter(item -> item.getEstado() == EstadoCupo.OCUPADO).count())
                .pendientes(cupos.stream().filter(item -> item.getEstado() == EstadoCupo.DISPONIBLE).count())
                .canceladas(cupos.stream().filter(item -> item.getEstado() == EstadoCupo.CANCELADO).count())
                .build();
    }

    private Paciente actualizarPaciente(Paciente paciente, NuevaCitaRequest request) {
        paciente.setNombre(request.getNombre());
        paciente.setEmail(request.getEmail());
        paciente.setTelefono(request.getTelefono());
        paciente.setFechaNacimiento(request.getFechaNacimiento());
        return pacienteRepository.save(paciente);
    }

    private Paciente crearPaciente(NuevaCitaRequest request) {
        return pacienteRepository.save(Paciente.builder()
                .nombre(request.getNombre())
                .rut(request.getRut())
                .email(request.getEmail())
                .telefono(request.getTelefono())
                .fechaNacimiento(request.getFechaNacimiento())
                .build());
    }

    private String generarCodigoDerivacion() {
        String codigo;
        do {
            codigo = "RN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        } while (listaEsperaRepository.findByCodigoDerivacion(codigo).isPresent());
        return codigo;
    }

    private Prioridad parsePrioridad(String value) {
        if (value == null || value.isBlank()) {
            return Prioridad.MEDIA;
        }
        return Prioridad.valueOf(value.trim().toUpperCase(Locale.ROOT));
    }

    private List<CupoDisponible> cuposReasignables() {
        return cuposRepository.findByEstadoInAndFechaCupoGreaterThanEqualOrderByFechaCupoAscHoraCupoAsc(
                List.of(EstadoCupo.CANCELADO, EstadoCupo.DISPONIBLE),
                LocalDate.now()
        );
    }

    private List<SugerenciaReasignacionResponse> sugerenciasParaCupo(CupoDisponible cupo) {
        return candidatosParaCupo(cupo).stream()
                .map(lista -> SugerenciaReasignacionResponse.builder()
                        .listaEsperaId(lista.getId())
                        .paciente(lista.getPaciente() == null ? "Paciente sin nombre" : lista.getPaciente().getNombre())
                        .rut(lista.getPaciente() == null ? "Sin RUT" : lista.getPaciente().getRut())
                        .especialidad(lista.getEspecialidad())
                        .diasEspera(lista.getDiasEspera())
                        .prioridad(lista.getPrioridad().getValue())
                        .match(calcularMatch(lista))
                        .build())
                .toList();
    }

    private List<ListaEspera> candidatosParaCupo(CupoDisponible cupo) {
        return listaEsperaRepository
                .findByEspecialidadAndEstadoInOrderByPrioridadAscDiasEsperaDesc(cupo.getEspecialidad(), ESTADOS_REASIGNABLES)
                .stream()
                .sorted(Comparator.comparingInt((ListaEspera item) -> prioridadPeso(item.getPrioridad())).reversed()
                        .thenComparing(ListaEspera::getDiasEspera, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    private int prioridadPeso(Prioridad prioridad) {
        if (prioridad == Prioridad.ALTA) return 3;
        if (prioridad == Prioridad.MEDIA) return 2;
        return 1;
    }

    private int calcularMatch(ListaEspera lista) {
        int prioridad = prioridadPeso(lista.getPrioridad()) * 20;
        int espera = Math.min(lista.getDiasEspera() == null ? 0 : lista.getDiasEspera(), 180) / 3;
        return Math.min(99, 35 + prioridad + espera);
    }

    private void validarAsignacion(CupoDisponible cupo, ListaEspera lista) {
        if (!cupo.getEspecialidad().equalsIgnoreCase(lista.getEspecialidad())) {
            throw new ResourceNotFoundException("El cupo no corresponde a la especialidad del paciente");
        }
        if (!ESTADOS_REASIGNABLES.contains(lista.getEstado())) {
            throw new ResourceNotFoundException("El paciente no esta disponible para reasignacion");
        }
    }

    private void asignar(CupoDisponible cupo, ListaEspera lista, String nota) {
        validarAsignacion(cupo, lista);
        cupo.setEstado(EstadoCupo.OCUPADO);
        cupo.setListaEsperaId(lista.getId());
        cupo.setMotivoCancelacion(null);

        lista.setEstado(EstadoPaciente.CITADO);
        lista.setFechaCita(cupo.getFechaCupo());
        lista.setHoraCita(cupo.getHoraCupo());
        lista.setNotas(appendNota(lista.getNotas(), nota));
        listaEsperaRepository.save(lista);
    }

    private void liberarPacienteActual(CupoDisponible cupo, String nota) {
        if (cupo.getListaEsperaId() == null) {
            return;
        }

        listaEsperaRepository.findById(cupo.getListaEsperaId()).ifPresent(lista -> {
            lista.setEstado(EstadoPaciente.EN_ESPERA);
            lista.setFechaCita(null);
            lista.setHoraCita(null);
            lista.setNotas(appendNota(lista.getNotas(), nota));
            listaEsperaRepository.save(lista);
        });
    }

    private ListaEspera pacienteAsignado(CupoDisponible cupo) {
        if (cupo.getListaEsperaId() == null) {
            throw new ResourceNotFoundException("El cupo no tiene paciente asignado");
        }
        return listaEsperaRepository.findById(cupo.getListaEsperaId())
                .orElseThrow(() -> new ResourceNotFoundException("Paciente de lista de espera no encontrado"));
    }

    private String nota(GestionCupoRequest request, String fallback) {
        if (request == null || request.getNota() == null || request.getNota().isBlank()) {
            return fallback;
        }
        return request.getNota();
    }

    private String appendNota(String actual, String nueva) {
        if (actual == null || actual.isBlank()) {
            return nueva;
        }
        return actual + "\n" + nueva;
    }

    private double promedioMeses(List<ListaEspera> registros) {
        double promedioDias = registros.stream()
                .map(ListaEspera::getDiasEspera)
                .filter(java.util.Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);
        return BigDecimal.valueOf(promedioDias / 30.0)
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private List<Map<String, Object>> tendencia(double promedioActual) {
        List<Map<String, Object>> rows = new ArrayList<>();
        Month current = LocalDate.now().getMonth();
        for (int i = 5; i >= 0; i--) {
            Month month = current.minus(i);
            double espera = BigDecimal.valueOf(promedioActual + (i * 0.2))
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("mes", month.getDisplayName(TextStyle.SHORT, new Locale("es", "CL")).replace(".", ""));
            row.put("espera", espera);
            row.put("meta", 2.9);
            rows.add(row);
        }
        return rows;
    }

    private List<Map<String, Object>> distribucionPrioridad() {
        return List.of(
                prioridadRow("Alta", listaEsperaRepository.countByPrioridad(Prioridad.ALTA), "#C62828"),
                prioridadRow("Media", listaEsperaRepository.countByPrioridad(Prioridad.MEDIA), "#E65100"),
                prioridadRow("Baja", listaEsperaRepository.countByPrioridad(Prioridad.BAJA), "#2E7D32")
        );
    }

    private Map<String, Object> prioridadRow(String name, long value, String color) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("name", name);
        row.put("value", value);
        row.put("color", color);
        return row;
    }

    private CupoResponse toResponse(CupoDisponible cupo) {
        ListaEspera lista = cupo.getListaEspera();
        if (lista == null && cupo.getListaEsperaId() != null) {
            lista = listaEsperaRepository.findById(cupo.getListaEsperaId()).orElse(null);
        }

        return CupoResponse.builder()
                .id(cupo.getId())
                .especialidad(cupo.getEspecialidad())
                .establecimiento(cupo.getEstablecimiento())
                .fechaCupo(cupo.getFechaCupo())
                .horaCupo(cupo.getHoraCupo())
                .medico(cupo.getMedico())
                .estado(cupo.getEstado() == null ? null : cupo.getEstado().getValue())
                .listaEsperaId(cupo.getListaEsperaId())
                .motivoCancelacion(cupo.getMotivoCancelacion())
                .listaEspera(lista == null ? null : listaEsperaService.toResponse(lista))
                .build();
    }
}
