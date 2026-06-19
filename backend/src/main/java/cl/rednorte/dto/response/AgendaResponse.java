package cl.rednorte.dto.response;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AgendaResponse {
    private AgendaMetricasResponse metricas;
    private List<CupoResponse> citas;
}
