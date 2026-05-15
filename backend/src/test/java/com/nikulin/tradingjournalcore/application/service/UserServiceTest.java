package com.nikulin.tradingjournalcore.application.service;

import com.nikulin.tradingjournalcore.domain.entity.User;
import com.nikulin.tradingjournalcore.infrastructure.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordService passwordService;
    @InjectMocks
    private UserService userService;

    @Test
    void getByIdReturnsUser() {
        var user = new User();
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

        assertThat(userService.getById("user-1")).isSameAs(user);
    }

    @Test
    void getByIdThrowsWhenUserMissing() {
        when(userRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getById("missing"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User not found: missing");
    }

    @Test
    void registerNormalizesEmailAndHashesPassword() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordService.hash("secret1")).thenReturn("hashed");
        when(userRepository.save(org.mockito.ArgumentMatchers.any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var user = userService.register("  Tema  ", " TEST@Example.COM ", "secret1");

        assertThat(user.getUsername()).isEqualTo("Tema");
        assertThat(user.getEmail()).isEqualTo("test@example.com");
        assertThat(user.getPassword()).isEqualTo("hashed");
        verify(userRepository).save(user);
    }

    @Test
    void registerUsesEmailAsUsernameWhenUsernameBlank() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordService.hash("secret1")).thenReturn("hashed");
        when(userRepository.save(org.mockito.ArgumentMatchers.any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var user = userService.register(" ", "test@example.com", "secret1");

        assertThat(user.getUsername()).isEqualTo("test@example.com");
    }

    @Test
    void registerRejectsDuplicateEmail() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.register("tema", "test@example.com", "secret1"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User with this email already exists");
    }

    @Test
    void registerRejectsShortPassword() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);

        assertThatThrownBy(() -> userService.register("tema", "test@example.com", "123"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Password must contain at least 6 characters");
    }

    @Test
    void loginReturnsUserWhenPasswordMatches() {
        var user = new User();
        user.setPassword("stored");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordService.matches("secret1", "stored")).thenReturn(true);

        assertThat(userService.login(" TEST@example.com ", "secret1")).isSameAs(user);
    }

    @Test
    void loginRejectsInvalidPassword() {
        var user = new User();
        user.setPassword("stored");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordService.matches("wrong", "stored")).thenReturn(false);

        assertThatThrownBy(() -> userService.login("test@example.com", "wrong"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid email or password");
    }
}
