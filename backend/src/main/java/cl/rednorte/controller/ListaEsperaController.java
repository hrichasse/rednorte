package cl.rednorte.controller;

import cl.rednorte.dto.request.ActualizarListaEsperaRequest;
import cl.rednorte.dto.response.ApiResponse;
import cl.rednorte.dto.response.ListaEsperaResponse;
import cl.rednorte.service.ListaEsperaService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lista-espera")
@RequiredArgsConstructor
public class ListaEsperaController {

    private final ListaEsperaService listaEsperaService;

    @GetMapping
    public ApiResponse<List<ListaEsperaResponse>> findAll() {
        return ApiResponse.ok(listaEsperaService.findAll());
    }

    @GetMapping("/estadisticas")
    public ApiResponse<Map<String, Object>> getEstadisticas() {
        return ApiResponse.ok(listaEsperaService.getEstadisticas());
    }

    @GetMapping("/{id}")
    public ApiResponse<ListaEsperaResponse> findById(@PathVariable UUID id) {
        return ApiResponse.ok(listaEsperaService.findById(id));
    }

    @PatchMapping("/{id}")
    public ApiResponse<ListaEsperaResponse> actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody ActualizarListaEsperaRequest request
    ) {
        return ApiResponse.ok("Registro actualizado correctamente", listaEsperaService.actualizar(id, request));
    }

    @GetMapping("/consulta-publica")
    public ApiResponse<ListaEsperaResponse> consultaPublica(
            @RequestParam String rut,
            @RequestParam String codigoDerivacion
    ) {
        return ApiResponse.ok(listaEsperaService.consultaPublica(rut, codigoDerivacion));
    }

    @GetMapping("/consulta-paciente")
    public ApiResponse<List<ListaEsperaResponse>> consultaPaciente(
            @RequestParam String rut,
            @RequestParam String numeroSerie
    ) {
        return ApiResponse.ok(listaEsperaService.consultaPaciente(rut, numeroSerie));
    }
}
