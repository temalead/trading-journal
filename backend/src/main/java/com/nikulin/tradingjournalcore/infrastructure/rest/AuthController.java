package com.nikulin.tradingjournalcore.infrastructure.rest;

import com.nikulin.tradingjournalcore.application.service.UserService;
import com.nikulin.tradingjournalcore.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    public ResponseEntity<Void> createUser(User user){
        return ResponseEntity.ok().build();
    }

    public ResponseEntity<Void> login(String email,
                                      String password
    ){
        return ResponseEntity.ok().build();
    }


}
