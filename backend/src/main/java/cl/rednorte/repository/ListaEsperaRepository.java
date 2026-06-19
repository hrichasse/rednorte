package cl.rednorte.repository;

import cl.rednorte.model.ListaEspera;
import cl.rednorte.model.enums.EstadoPaciente;
import cl.rednorte.model.enums.Prioridad;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ListaEsperaRepository extends JpaRepository<ListaEspera, UUID> {
    Optional<ListaEspera> findByCodigoDerivacion(String codigoDerivacion);
    List<ListaEspera> findAllByOrderByDiasEsperaDesc();
    List<ListaEspera> findByEspecialidad(String especialidad);
    List<ListaEspera> findByPrioridad(Prioridad prioridad);
    List<ListaEspera> findByEspecialidadAndEstadoInOrderByPrioridadAscDiasEsperaDesc(
            String especialidad,
            List<EstadoPaciente> estados
    );
    long countByEstado(EstadoPaciente estado);
    long countByPrioridad(Prioridad prioridad);
}
