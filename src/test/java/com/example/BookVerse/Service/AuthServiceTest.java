package com.example.BookVerse.Service;

import com.example.BookVerse.Repository.Entity.Role;
import com.example.BookVerse.Repository.Entity.User;
import com.example.BookVerse.Repository.RoleRepository;
import com.example.BookVerse.Repository.UserRepository;
import com.example.BookVerse.dto.AuthDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    private UserRepository userRepository;
    private RoleRepository roleRepository;
    private PasswordEncoder passwordEncoder;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        roleRepository = mock(RoleRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);

        authService = new AuthService(
                userRepository,
                passwordEncoder,
                mock(AuthenticationManager.class),
                mock(JwtService.class),
                roleRepository
        );
    }

    @Test
    void registerCreatesDefaultUserRoleWhenRolesTableIsEmpty() {
        Role savedRole = new Role();
        savedRole.setRole("USER");

        when(userRepository.findByLogin("reader")).thenReturn(Optional.empty());
        when(roleRepository.findByRoleIgnoreCase("USER")).thenReturn(Optional.empty());
        when(roleRepository.save(any(Role.class))).thenReturn(savedRole);
        when(passwordEncoder.encode("secret")).thenReturn("encoded-secret");

        authService.register(new AuthDTO.RegisterRequest("reader", "secret", null));

        verify(roleRepository).save(any(Role.class));
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerRejectsUnknownRoleInsteadOfSavingUserWithoutRole() {
        when(userRepository.findByLogin("reader")).thenReturn(Optional.empty());
        when(roleRepository.findByRoleIgnoreCase("ADMIN")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.register(new AuthDTO.RegisterRequest("reader", "secret", "ADMIN")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Unknown role: ADMIN");
    }
}
