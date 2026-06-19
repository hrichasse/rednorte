package cl.rednorte.controller;

import cl.rednorte.dto.request.AsignarCupoRequest;
import cl.rednorte.dto.request.CancelarCupoRequest;
import cl.rednorte.dto.request.GestionCupoRequest;
import cl.rednorte.dto.request.NuevaCitaRequest;
import cl.rednorte.dto.response.AgendaResponse;
import cl.rednorte.dto.response.ApiResponse;
import cl.rednorte.dto.response.CupoResponse;
import cl.rednorte.dto.response.ReasignacionResponse;
import cl.rednorte.dto.response.ReporteResponse;
import cl.rednorte.dto.response.SugerenciaReasignacionResponse;
import cl.rednorte.service.CuposService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cupos")
@RequiredArgsConstructor
public class CuposController {

    private final CuposService cuposService;

    @GetMapping("/disponibles")
    public ApiResponse<List<CupoResponse>> findDisponibles() {
        return ApiResponse.ok(cuposService.findDisponibles());
    }

    @GetMapping("/agenda")
    public ApiResponse<AgendaResponse> getAgenda(@RequestParam(required = false) LocalDate fecha) {
        return ApiResponse.ok(cuposService.getAgenda(fecha));
    }

    @PostMapping("/citas")
    public ApiResponse<CupoResponse> crearCita(@Valid @RequestBody NuevaCitaRequest request) {
        return ApiResponse.ok("Cita creada correctamente", cuposService.crearCita(request));
    }

    @GetMapping("/reasignacion")
    public ApiResponse<ReasignacionResponse> getReasignacion() {
        return ApiResponse.ok(cuposService.getReasignacion());
    }

    @PostMapping("/{id}/asignar")
    public ApiResponse<CupoResponse> asignarCupo(
            @PathVariable UUID id,
            @Valid @RequestBody AsignarCupoRequest request
    ) {
        return ApiResponse.ok("Cupo reasignado correctamente", cuposService.asignarCupo(id, request));
    }

    @GetMapping("/{id}/sugerencias")
    public ApiResponse<List<SugerenciaReasignacionResponse>> sugerenciasCupo(@PathVariable UUID id) {
        return ApiResponse.ok(cuposService.sugerenciasParaCupo(id));
    }

    @PostMapping("/{id}/cancelar")
    public ApiResponse<CupoResponse> cancelarCupo(
            @PathVariable UUID id,
            @Valid @RequestBody CancelarCupoRequest request
    ) {
        return ApiResponse.ok("Cupo cancelado correctamente", cuposService.cancelarCupo(id, request));
    }

    @PostMapping("/{id}/confirmar")
    public ApiResponse<CupoResponse> confirmarCupo(
            @PathVariable UUID id,
            @RequestBody(required = false) GestionCupoRequest request
    ) {
        return ApiResponse.ok("Cita confirmada correctamente", cuposService.confirmarCupo(id, request));
    }

    @PostMapping("/{id}/atendida")
    public ApiResponse<CupoResponse> marcarAtendida(
            @PathVariable UUID id,
            @RequestBody(required = false) GestionCupoRequest request
    ) {
        return ApiResponse.ok("Cita marcada como atendida", cuposService.marcarAtendida(id, request));
    }

    @PostMapping("/{id}/no-asistio")
    public ApiResponse<CupoResponse> marcarNoAsistio(
            @PathVariable UUID id,
            @RequestBody(required = false) GestionCupoRequest request
    ) {
        return ApiResponse.ok("Inasistencia registrada correctamente", cuposService.marcarNoAsistio(id, request));
    }

    @PostMapping("/reasignacion/automatica")
    public ApiResponse<List<CupoResponse>> reasignarTodos() {
        return ApiResponse.ok("Reasignacion automatica ejecutada", cuposService.reasignarTodos());
    }

    @GetMapping("/reportes")
    public ApiResponse<ReporteResponse> getReportes() {
        return ApiResponse.ok(cuposService.getReportes());
    }

    @GetMapping("/cancelados/count")
    public ApiResponse<Long> countCancelados() {
        return ApiResponse.ok(cuposService.countCancelados());
    }
}
