package com.nikulin.tradingjournalcore.infrastructure.repository;

import com.nikulin.tradingjournalcore.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {
}
