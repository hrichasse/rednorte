package cl.rednorte.service;

import cl.rednorte.dto.request.ActualizarListaEsperaRequest;
import cl.rednorte.dto.response.ListaEsperaResponse;
import cl.rednorte.dto.response.PacienteResponse;
import cl.rednorte.exception.ResourceNotFoundException;
import cl.rednorte.model.ListaEspera;
import cl.rednorte.model.Paciente;
import cl.rednorte.model.enums.EstadoCupo;
import cl.rednorte.model.enums.EstadoPaciente;
import cl.rednorte.model.enums.Prioridad;
import cl.rednorte.repository.CuposRepository;
import cl.rednorte.repository.ListaEsperaRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ListaEsperaService {

    private final ListaEsperaRepository listaEsperaRepository;
    private final CuposRepository cuposRepository;

    public List<ListaEsperaResponse> findAll() {
        return listaEsperaRepository.findAllByOrderByDiasEsperaDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    public ListaEsperaResponse findByCodigoDerivacion(String codigo) {
        return listaEsperaRepository.findByCodigoDerivacion(codigo)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de lista de espera no encontrado"));
    }

    public ListaEsperaResponse findById(UUID id) {
        return listaEsperaRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de lista de espera no encontrado"));
    }

    @Transactional
    public ListaEsperaResponse actualizar(UUID id, ActualizarListaEsperaRequest request) {
        ListaEspera lista = listaEsperaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de lista de espera no encontrado"));

        if (hasText(request.prioridad())) {
            lista.setPrioridad(Prioridad.valueOf(request.prioridad()));
        }

        if (hasText(request.estado())) {
            lista.setEstado(EstadoPaciente.fromValue(request.estado()));
        }

        if (request.notas() != null) {
            lista.setNotas(request.notas().trim().isBlank() ? null : request.notas().trim());
        }

        return toResponse(listaEsperaRepository.save(lista));
    }

    public ListaEsperaResponse consultaPublica(String rut, String codigo) {
        ListaEspera lista = listaEsperaRepository.findByCodigoDerivacion(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("No encontramos un registro con esos datos"));

        Paciente paciente = lista.getPaciente();
        if (paciente == null || !normalizarRut(paciente.getRut()).equals(normalizarRut(rut))) {
            throw new ResourceNotFoundException("No encontramos un registro con esos datos");
        }

        return toResponse(lista);
    }

    public Map<String, Object> getEstadisticas() {
        List<ListaEspera> registros = listaEsperaRepository.findAll();
        Map<String, Long> porEstado = registros.stream()
                .filter(item -> item.getEstado() != null)
                .collect(Collectors.groupingBy(item -> item.getEstado().getValue(), LinkedHashMap::new, Collectors.counting()));
        Map<String, Long> porEspecialidad = registros.stream()
                .filter(item -> item.getEspecialidad() != null)
                .collect(Collectors.groupingBy(ListaEspera::getEspecialidad, LinkedHashMap::new, Collectors.counting()));
        Map<String, Long> porPrioridad = registros.stream()
                .filter(item -> item.getPrioridad() != null)
                .collect(Collectors.groupingBy(item -> item.getPrioridad().getValue(), LinkedHashMap::new, Collectors.counting()));

        double promedioDias = registros.stream()
                .map(ListaEspera::getDiasEspera)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);
        double promedioMeses = BigDecimal.valueOf(promedioDias / 30.0)
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();

        Map<String, Object> estadisticas = new LinkedHashMap<>();
        estadisticas.put("totalPacientes", registros.size());
        estadisticas.put("porEstado", porEstado);
        estadisticas.put("porEspecialidad", porEspecialidad);
        estadisticas.put("porPrioridad", porPrioridad);
        estadisticas.put("cuposDisponibles", cuposRepository.countByEstado(EstadoCupo.DISPONIBLE));
        estadisticas.put("cuposOcupados", cuposRepository.countByEstado(EstadoCupo.OCUPADO));
        estadisticas.put("cuposCancelados", cuposRepository.countByEstado(EstadoCupo.CANCELADO));
        estadisticas.put("reasignacionesMes", cuposRepository.countByEstadoAndListaEsperaIdIsNotNull(EstadoCupo.OCUPADO));
        estadisticas.put("tiempoPromedioEspera", promedioMeses);
        estadisticas.put("enEspera", listaEsperaRepository.countByEstado(EstadoPaciente.EN_ESPERA));
        return estadisticas;
    }

    public ListaEsperaResponse toResponse(ListaEspera lista) {
        return ListaEsperaResponse.builder()
                .id(lista.getId())
                .codigoDerivacion(lista.getCodigoDerivacion())
                .especialidad(lista.getEspecialidad())
                .establecimiento(lista.getEstablecimiento())
                .prioridad(lista.getPrioridad() == null ? null : lista.getPrioridad().getValue())
                .estado(lista.getEstado() == null ? null : lista.getEstado().getValue())
                .diasEspera(lista.getDiasEspera())
                .fechaIngreso(lista.getFechaIngreso())
                .fechaCita(lista.getFechaCita())
                .horaCita(lista.getHoraCita())
                .notas(lista.getNotas())
                .paciente(toPacienteResponse(lista.getPaciente()))
                .build();
    }

    private PacienteResponse toPacienteResponse(Paciente paciente) {
        if (paciente == null) {
            return null;
        }
        return PacienteResponse.builder()
                .id(paciente.getId())
                .nombre(paciente.getNombre())
                .rut(paciente.getRut())
                .email(paciente.getEmail())
                .telefono(paciente.getTelefono())
                .fechaNacimiento(paciente.getFechaNacimiento())
                .build();
    }

    private String normalizarRut(String rut) {
        return rut == null ? "" : rut.replace(".", "").replace("-", "").trim().toLowerCase();
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
