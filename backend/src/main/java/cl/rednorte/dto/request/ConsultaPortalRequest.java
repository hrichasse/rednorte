package cl.rednorte.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ConsultaPortalRequest(
        @NotBlank(message = "El RUT es obligatorio")
        String rut,

        @NotBlank(message = "El codigo de derivacion es obligatorio")
        String codigoDerivacion
) {
}
