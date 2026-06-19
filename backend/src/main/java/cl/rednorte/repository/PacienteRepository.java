package cl.rednorte.repository;

import cl.rednorte.model.Paciente;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PacienteRepository extends JpaRepository<Paciente, UUID> {
    Optional<Paciente> findByRut(String rut);
    boolean existsByRut(String rut);
}
