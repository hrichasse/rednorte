package cl.rednorte.service;

import cl.rednorte.dto.response.PacienteResponse;
import cl.rednorte.exception.ResourceNotFoundException;
import cl.rednorte.model.Paciente;
import cl.rednorte.repository.PacienteRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PacienteService {

    private final PacienteRepository pacienteRepository;

    public List<PacienteResponse> findAll() {
        return pacienteRepository.findAll().stream().map(this::toResponse).toList();
    }

    public PacienteResponse findById(UUID id) {
        return pacienteRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado"));
    }

    public PacienteResponse findByRut(String rut) {
        return pacienteRepository.findByRut(rut)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado"));
    }

    PacienteResponse toResponse(Paciente paciente) {
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
}
