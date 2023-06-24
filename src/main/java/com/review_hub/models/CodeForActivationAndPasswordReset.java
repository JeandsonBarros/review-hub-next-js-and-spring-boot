package com.review_hub.models;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "tab_code_fo_activation_and_password_reset")
public class CodeForActivationAndPasswordReset {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private Long id;
    @Column(nullable = false)
    private Long recoveryCode;
    @OneToOne
    @JoinColumn(name = "user_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;
    @Column(nullable = false)
    private Long codeExpirationTime;

    public Long getCodeExpirationTime() {
        return codeExpirationTime;
    }

    public void setCodeExpirationTime(Long codeExpirationTime) {
        this.codeExpirationTime = codeExpirationTime;
    }

    public Long getRecoveryCode() {
        return recoveryCode;
    }

    public void setRecoveryCode(Long recoveryCode) {
        this.recoveryCode = recoveryCode;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
