package cl.rednorte.repository;

import cl.rednorte.model.CupoDisponible;
import cl.rednorte.model.enums.EstadoCupo;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CuposRepository extends JpaRepository<CupoDisponible, UUID> {
    List<CupoDisponible> findByEstado(EstadoCupo estado);
    List<CupoDisponible> findByFechaCupoOrderByHoraCupoAsc(LocalDate fechaCupo);
    List<CupoDisponible> findAllByOrderByFechaCupoAscHoraCupoAsc();
    List<CupoDisponible> findByEstadoInAndFechaCupoGreaterThanEqualOrderByFechaCupoAscHoraCupoAsc(
            List<EstadoCupo> estados,
            LocalDate fechaCupo
    );
    long countByEstado(EstadoCupo estado);
    long countByEstadoAndListaEsperaIdIsNotNull(EstadoCupo estado);
}
