package com.review_hub.models;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

/* Permission code for the user to activate the account or restore the forgotten password */
@Entity
@Table(name = "tab_permission_code")
public class PermissionCode {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private Long id;
    @Column(nullable = false)
    private Long code;
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

    public Long getCode() {
        return code;
    }

    public void setCode(Long code) {
        this.code = code;
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
