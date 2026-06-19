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
public class CupoResponse {
    private UUID id;
    private String especialidad;
    private String establecimiento;
    private LocalDate fechaCupo;
    private LocalTime horaCupo;
    private String medico;
    private String estado;
    private UUID listaEsperaId;
    private String motivoCancelacion;
    private ListaEsperaResponse listaEspera;
}
