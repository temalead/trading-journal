package com.nikulin.tradingjournalcore.domain.entity;

import java.util.List;

public class User {
    private String id;
    private String username;
    private String password;
    private String email;
    private List<Account> accounts;
}
