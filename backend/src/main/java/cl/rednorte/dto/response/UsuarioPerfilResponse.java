package cl.rednorte.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UsuarioPerfilResponse {
    private String nombre;
    private String email;
    private String rol;
    private String cargo;
    private String unidad;
    private String establecimiento;
    private String telefono;
    private LocalDateTime ultimoAcceso;
    private List<String> permisos;
}
