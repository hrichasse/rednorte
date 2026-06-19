package cl.rednorte.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.Data;

@Data
public class AsignarCupoRequest {
    @NotNull
    private UUID listaEsperaId;
}
