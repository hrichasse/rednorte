package cl.rednorte.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ListaEsperaResponse {
    private UUID id;
    private String codigoDerivacion;
    private String especialidad;
    private String establecimiento;
    private String prioridad;
    private String estado;
    private Integer diasEspera;
    private LocalDate fechaIngreso;
    private LocalDate fechaCita;
    private LocalTime horaCita;
    private String notas;
    private PacienteResponse paciente;
}
