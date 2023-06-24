package com.review_hub.repository;

import com.review_hub.models.CodeForActivationAndPasswordReset;
import com.review_hub.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CodeForActivationAndPasswordResetRepository extends JpaRepository<CodeForActivationAndPasswordReset, Long> {
    Optional<CodeForActivationAndPasswordReset> findByRecoveryCodeAndUser(Long recoveryCode, User user);
    Optional<CodeForActivationAndPasswordReset> findByUser(User user);
}
