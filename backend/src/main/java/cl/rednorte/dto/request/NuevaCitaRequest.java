package cl.rednorte.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Data;

@Data
public class NuevaCitaRequest {
    @NotBlank
    private String nombre;

    @NotBlank
    private String rut;

    @Email
    private String email;

    private String telefono;

    private LocalDate fechaNacimiento;

    @NotBlank
    private String especialidad;

    @NotBlank
    private String establecimiento;

    @NotNull
    private LocalDate fechaCupo;

    @NotNull
    private LocalTime horaCupo;

    private String medico;

    @Pattern(regexp = "ALTA|MEDIA|BAJA", message = "La prioridad debe ser ALTA, MEDIA o BAJA")
    private String prioridad = "MEDIA";

    private String notas;
}
