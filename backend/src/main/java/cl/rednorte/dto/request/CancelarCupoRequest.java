package cl.rednorte.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CancelarCupoRequest {
    @NotBlank
    private String motivo;
}
