package cl.rednorte.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AgendaMetricasResponse {
    private long citas;
    private long confirmadas;
    private long pendientes;
    private long canceladas;
}
