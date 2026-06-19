package cl.rednorte.controller;

import cl.rednorte.dto.response.ApiResponse;
import cl.rednorte.dto.response.PacienteResponse;
import cl.rednorte.service.PacienteService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pacientes")
@RequiredArgsConstructor
public class PacienteController {

    private final PacienteService pacienteService;

    @GetMapping
    public ApiResponse<List<PacienteResponse>> findAll() {
        return ApiResponse.ok(pacienteService.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<PacienteResponse> findById(@PathVariable UUID id) {
        return ApiResponse.ok(pacienteService.findById(id));
    }
}
