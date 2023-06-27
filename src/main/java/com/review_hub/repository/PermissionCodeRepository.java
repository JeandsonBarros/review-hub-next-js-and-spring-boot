package com.review_hub.repository;

import com.review_hub.models.PermissionCode;
import com.review_hub.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PermissionCodeRepository extends JpaRepository<PermissionCode, Long> {
    Optional<PermissionCode> findByCodeAndUser(Long code, User user);
    Optional<PermissionCode> findByUser(User user);
}
