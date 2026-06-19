package cl.rednorte.service;

import cl.rednorte.dto.request.LoginRequest;
import cl.rednorte.dto.request.RegisterRequest;
import cl.rednorte.dto.response.AuthResponse;
import cl.rednorte.dto.response.UsuarioPerfilResponse;
import cl.rednorte.exception.ResourceNotFoundException;
import cl.rednorte.exception.UnauthorizedException;
import cl.rednorte.model.Usuario;
import cl.rednorte.repository.UsuarioRepository;
import cl.rednorte.security.JwtUtil;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(request.email())
                .filter(Usuario::isActivo)
                .orElseThrow(() -> new UnauthorizedException("Credenciales incorrectas"));

        if (!passwordEncoder.matches(request.password(), usuario.getPasswordHash())) {
            throw new UnauthorizedException("Credenciales incorrectas");
        }

        String role = toSpringRole(usuario.getRol());
        String token = jwtUtil.generateToken(usuario.getEmail(), role);
        return AuthResponse.builder()
                .token(token)
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .rol(role)
                .expiresIn(jwtUtil.getExpirationSeconds())
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ResourceNotFoundException("Ya existe un funcionario registrado con ese correo");
        }

        String rol = normalizePublicRole(request.rol());
        Usuario usuario = usuarioRepository.save(Usuario.builder()
                .nombre(request.nombre())
                .email(request.email().trim().toLowerCase(Locale.ROOT))
                .passwordHash(passwordEncoder.encode(request.password()))
                .rol(rol)
                .establecimiento(request.establecimiento())
                .activo(true)
                .build());

        String springRole = toSpringRole(usuario.getRol());
        String token = jwtUtil.generateToken(usuario.getEmail(), springRole);
        return AuthResponse.builder()
                .token(token)
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .rol(springRole)
                .expiresIn(jwtUtil.getExpirationSeconds())
                .build();
    }

    @Transactional(readOnly = true)
    public UsuarioPerfilResponse me(String email) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email)
                .filter(Usuario::isActivo)
                .orElseThrow(() -> new UnauthorizedException("No autorizado"));

        return UsuarioPerfilResponse.builder()
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .rol(toSpringRole(usuario.getRol()))
                .cargo(cargoFromRol(usuario.getRol()))
                .unidad(usuario.getEstablecimiento())
                .establecimiento(usuario.getEstablecimiento())
                .telefono("")
                .ultimoAcceso(LocalDateTime.now())
                .permisos(permisos(usuario.getRol()))
                .build();
    }

    private String normalizePublicRole(String role) {
        if (role == null || role.isBlank()) {
            return "ADMINISTRATIVO";
        }
        String normalized = role.trim().toUpperCase(Locale.ROOT);
        if ("ADMIN".equals(normalized)) {
            return "ADMINISTRATIVO";
        }
        return normalized;
    }

    private String toSpringRole(String role) {
        return "ROLE_" + role;
    }

    private String cargoFromRol(String role) {
        return switch (role) {
            case "ADMIN" -> "Administrador del sistema";
            case "MEDICO" -> "Funcionario medico";
            default -> "Funcionario administrativo";
        };
    }

    private List<String> permisos(String role) {
        if ("ADMIN".equals(role)) {
            return List.of(
                    "Gestion de lista de espera",
                    "Reasignacion de cupos",
                    "Reportes y exportaciones",
                    "Administracion de usuarios"
            );
        }
        if ("MEDICO".equals(role)) {
            return List.of(
                    "Gestion de lista de espera",
                    "Agenda de citas",
                    "Reasignacion de cupos"
            );
        }
        return List.of(
                "Gestion de lista de espera",
                "Agenda de citas"
        );
    }
}
