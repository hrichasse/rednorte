package cl.rednorte.dto.response;

import java.time.LocalDate;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PacienteResponse {
    private UUID id;
    private String nombre;
    private String rut;
    private String email;
    private String telefono;
    private LocalDate fechaNacimiento;
}
