package cl.rednorte.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ActualizarListaEsperaRequest(
        @Pattern(regexp = "ALTA|MEDIA|BAJA", message = "La prioridad debe ser ALTA, MEDIA o BAJA")
        String prioridad,

        @Pattern(regexp = "En espera|Citado|Urgente|Atendido", message = "El estado debe ser En espera, Citado, Urgente o Atendido")
        String estado,

        @Size(max = 1000, message = "Las notas no pueden superar los 1000 caracteres")
        String notas
) {
}
