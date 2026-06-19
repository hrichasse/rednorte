package cl.rednorte.dto.response;

import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SugerenciaReasignacionResponse {
    private UUID listaEsperaId;
    private String paciente;
    private String rut;
    private String especialidad;
    private Integer diasEspera;
    private String prioridad;
    private Integer match;
}
