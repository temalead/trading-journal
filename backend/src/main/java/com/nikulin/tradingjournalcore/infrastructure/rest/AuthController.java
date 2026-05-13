package com.nikulin.tradingjournalcore.infrastructure.rest;

import com.nikulin.tradingjournalcore.application.service.AccountService;
import com.nikulin.tradingjournalcore.application.service.UserService;
import com.nikulin.tradingjournalcore.domain.entity.Account;
import com.nikulin.tradingjournalcore.domain.entity.User;
import com.nikulin.tradingjournalcore.infrastructure.rest.dto.AuthDtos.AuthResponse;
import com.nikulin.tradingjournalcore.infrastructure.rest.dto.AuthDtos.LoginRequest;
import com.nikulin.tradingjournalcore.infrastructure.rest.dto.AuthDtos.RegisterRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    private final AccountService accountService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> createUser(@RequestBody RegisterRequest request) {
        User user = userService.register(request.username(), request.email(), request.password());
        Account account = accountService.createDefaultAccount(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(user, account));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        var user = userService.login(request.email(), request.password());
        var account = accountService.findPrimaryAccount(user);
        return ResponseEntity.ok(toResponse(user, account));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(exception.getMessage());
    }

    private AuthResponse toResponse(User user, Account account) {
        return new AuthResponse(user.getId(), account.getId(), user.getUsername(), user.getEmail());
    }
}
