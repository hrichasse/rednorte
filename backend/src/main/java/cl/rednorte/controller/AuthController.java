package cl.rednorte.controller;

import cl.rednorte.dto.request.LoginRequest;
import cl.rednorte.dto.request.RegisterRequest;
import cl.rednorte.dto.response.ApiResponse;
import cl.rednorte.dto.response.AuthResponse;
import cl.rednorte.dto.response.UsuarioPerfilResponse;
import cl.rednorte.service.AuthService;
import jakarta.validation.Valid;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok("Sesion iniciada correctamente", authService.login(request));
    }

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok("Funcionario registrado correctamente", authService.register(request));
    }

    @GetMapping("/me")
    public ApiResponse<UsuarioPerfilResponse> me(Principal principal) {
        return ApiResponse.ok(authService.me(principal.getName()));
    }
}
