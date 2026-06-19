package cl.rednorte.dto.response;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReasignacionResponse {
    private long cuposLiberados;
    private long reasignacionesAutomaticas;
    private long tasaRecuperacion;
    private List<CupoResponse> cupos;
    private List<SugerenciaReasignacionResponse> sugerencias;
}
