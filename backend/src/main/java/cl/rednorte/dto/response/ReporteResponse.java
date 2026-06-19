package cl.rednorte.dto.response;

import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReporteResponse {
    private long pacientesAtendidosMes;
    private long cuposReasignadosMes;
    private double tiempoPromedioEspera;
    private double cumplimientoGes;
    private List<Map<String, Object>> tendenciaEspera;
    private List<Map<String, Object>> distribucionPrioridad;
}
