package cl.rednorte.controller;

import cl.rednorte.dto.response.ListaEsperaResponse;
import cl.rednorte.dto.response.PacienteResponse;
import cl.rednorte.model.Usuario;
import cl.rednorte.repository.UsuarioRepository;
import cl.rednorte.security.JwtUtil;
import cl.rednorte.service.CuposService;
import cl.rednorte.service.ListaEsperaService;
import cl.rednorte.service.PacienteService;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration",
        "jwt.secret=01234567890123456789012345678901",
        "jwt.expiration=86400000"
})
@AutoConfigureMockMvc
class ListaEsperaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @MockBean
    private PacienteService pacienteService;

    @MockBean
    private ListaEsperaService listaEsperaService;

    @MockBean
    private CuposService cuposService;

    @MockBean
    private UsuarioRepository usuarioRepository;

    @BeforeEach
    void setupUsuario() {
        when(usuarioRepository.findByEmailIgnoreCase(anyString())).thenReturn(Optional.empty());
        when(usuarioRepository.findByEmailIgnoreCase("admin@rednorte.cl")).thenReturn(Optional.of(Usuario.builder()
                .nombre("Administrador RedNorte")
                .email("admin@rednorte.cl")
                .passwordHash("")
                .rol("ADMIN")
                .establecimiento("Hospital Regional del Norte")
                .activo(true)
                .build()));
    }

    @Test
    void findAllSinTokenRetornaUnauthorized() throws Exception {
        mockMvc.perform(get("/api/lista-espera"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void findAllConTokenValidoRetornaLista() throws Exception {
        when(listaEsperaService.findAll()).thenReturn(List.of(sampleResponse()));
        String token = jwtUtil.generateToken("admin@rednorte.cl");

        mockMvc.perform(get("/api/lista-espera")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].codigoDerivacion").value("RN-001"));
    }

    @Test
    void consultaPublicaSinAuthRetornaOk() throws Exception {
        when(listaEsperaService.consultaPublica(anyString(), anyString())).thenReturn(sampleResponse());

        mockMvc.perform(get("/api/lista-espera/consulta-publica")
                        .param("rut", "12.345.678-9")
                        .param("codigoDerivacion", "RN-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.codigoDerivacion").value("RN-001"));
    }

    private ListaEsperaResponse sampleResponse() {
        return ListaEsperaResponse.builder()
                .id(UUID.randomUUID())
                .codigoDerivacion("RN-001")
                .especialidad("Traumatologia")
                .establecimiento("Hospital Regional del Norte")
                .prioridad("ALTA")
                .estado("En espera")
                .diasEspera(30)
                .paciente(PacienteResponse.builder()
                        .id(UUID.randomUUID())
                        .nombre("Paciente Demo")
                        .rut("12.345.678-9")
                        .build())
                .build();
    }
}
