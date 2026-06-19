package cl.rednorte.model;

import cl.rednorte.model.enums.EstadoCupo;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;
import cl.rednorte.model.converter.EstadoCupoConverter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cupos_disponibles")
public class CupoDisponible {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "especialidad", nullable = false)
    private String especialidad;

    @Column(name = "establecimiento", nullable = false)
    private String establecimiento;

    @Column(name = "fecha_cupo", nullable = false)
    private LocalDate fechaCupo;

    @Column(name = "hora_cupo", nullable = false)
    private LocalTime horaCupo;

    @Column(name = "medico")
    private String medico;

    @Convert(converter = EstadoCupoConverter.class)
    @Column(name = "estado", nullable = false)
    private EstadoCupo estado;

    @Column(name = "lista_espera_id")
    private UUID listaEsperaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lista_espera_id", insertable = false, updatable = false)
    private ListaEspera listaEspera;

    @Column(name = "motivo_cancelacion")
    private String motivoCancelacion;
}
