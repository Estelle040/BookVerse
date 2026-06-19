package com.example.BookVerse.Service;

import com.example.BookVerse.Repository.Entity.Role;
import com.example.BookVerse.Repository.Entity.User;
import com.example.BookVerse.Repository.RoleRepository;
import com.example.BookVerse.Repository.UserRepository;
import com.example.BookVerse.dto.AuthDTO;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final String DEFAULT_ROLE = "USER";

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final RoleRepository roleRepository;

    public AuthService(UserRepository repo,
                       PasswordEncoder encoder,
                       AuthenticationManager authManager,
                       JwtService jwtService, RoleRepository roleRepository) {
        this.repo = repo;
        this.encoder = encoder;
        this.authManager = authManager;
        this.jwtService = jwtService;
        this.roleRepository = roleRepository;
    }

    @Transactional
    public void register(AuthDTO.RegisterRequest req) {
        validateRegisterRequest(req);

        if (repo.findByLogin(req.login()).isPresent()) {
            throw new IllegalArgumentException("User already exists");
        }

        Role role = resolveRole(req.role());

        User user = new User();
        user.setLogin(req.login());
        user.setPassword(encoder.encode(req.password()));
        user.setRole(role);

        repo.save(user);
    }

    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest req) {

        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        req.login(),
                        req.password()
                )
        );

        String token = jwtService.generateToken(req.login());

        return new AuthDTO.AuthResponse(token);
    }

    private void validateRegisterRequest(AuthDTO.RegisterRequest req) {
        if (req == null || isBlank(req.login()) || isBlank(req.password())) {
            throw new IllegalArgumentException("Login and password are required");
        }
    }

    private Role resolveRole(String requestedRole) {
        String roleName = normalizeRole(requestedRole);

        return roleRepository.findByRoleIgnoreCase(roleName)
                .orElseGet(() -> {
                    if (!DEFAULT_ROLE.equals(roleName)) {
                        throw new IllegalArgumentException("Unknown role: " + roleName);
                    }

                    Role role = new Role();
                    role.setRole(DEFAULT_ROLE);
                    role.setDescription("Default user role");
                    return roleRepository.save(role);
                });
    }

    private String normalizeRole(String role) {
        if (isBlank(role)) {
            return DEFAULT_ROLE;
        }

        String normalized = role.trim().toUpperCase();
        if (normalized.startsWith("ROLE_")) {
            return normalized.substring("ROLE_".length());
        }
        return normalized;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
