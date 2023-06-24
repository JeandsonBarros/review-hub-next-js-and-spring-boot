package com.review_hub.config;

import com.review_hub.models.User;
import com.review_hub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class MasterCreate implements CommandLineRunner {

    @Autowired
    private UserRepository userAuthRepository;
    @Autowired
    private PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        try {

            if(!userAuthRepository.existsByEmail("jeandsonbarros@outlook.com")) {
                User userMaster = new User();
                userMaster.setName("Master");
                userMaster.setEmail("jeandsonbarros@outlook.com");
                userMaster.setPassword(encoder.encode("zorosola"));
                userMaster.setActive(true);
                userMaster.setRole("MASTER");
                userMaster.setProfileImageName("1gengar.gif");
                userMaster = userAuthRepository.save(userMaster);

                System.out.println("======= ACCOUNT MASTER CREATED =========");
                System.out.println("ID: " + userMaster.getId());
                System.out.println("Name: " + userMaster.getName());
                System.out.println("Email: " + userMaster.getEmail());
                System.out.println("Password: zorosola");
                System.out.println("Role: " + userMaster.getRole());
                System.out.println("========================================");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
