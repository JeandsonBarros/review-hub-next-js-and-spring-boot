package com.review_hub.services;

import com.review_hub.dtos.CodeChangeForgottenPasswordDTO;
import com.review_hub.dtos.CodeRegistrationDTO;
import com.review_hub.dtos.LoginDTO;
import com.review_hub.dtos.UserDTO;
import com.review_hub.exception.UnauthorizedExceptionsHandler;
import com.review_hub.models.Message;
import com.review_hub.models.PermissionCode;
import com.review_hub.models.User;
import com.review_hub.repository.PermissionCodeRepository;
import com.review_hub.repository.UserRepository;
import com.review_hub.security.JWTCreator;
import com.review_hub.security.JWTObject;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.webjars.NotFoundException;

import java.io.IOException;
import java.util.Date;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder encoder;
    @Autowired
    private JWTCreator jwtCreator;
    @Autowired
    private JavaMailSender emailSender;
    @Autowired
    private PermissionCodeRepository permissionCodeRepository;
    @Autowired
    private FileService fileService;

    public Message login(LoginDTO loginDTO) {

        Optional<User> user = userRepository.findByEmail(loginDTO.getEmail());

        if (!user.isPresent()) {
            throw new NotFoundException("User with email '" + loginDTO.getEmail() + "' not found");
        }

        boolean passwordOk = encoder.matches(loginDTO.getPassword(), user.get().getPassword());
        if (!passwordOk) {
            throw new UnauthorizedExceptionsHandler("Incorrect password for email: " + loginDTO.getEmail());
        }

        if (!user.get().getActive()) {
            throw new UnauthorizedExceptionsHandler("The registration of this account has not been completed, use the code that was sent to the email " + loginDTO.getEmail() + " to complete the registration.");
        }

        JWTObject jwtObject = new JWTObject();
        jwtObject.setSubject(user.get().getEmail());
        jwtObject.setUserId(user.get().getId());
        jwtObject.setIssuedAt(new Date(System.currentTimeMillis()));
        jwtObject.setRole(user.get().getRole());

        Message message = new Message(
                HttpStatus.CREATED.value(),
                new Date(),
                jwtCreator.create(jwtObject),
                "JWT token to be sent in the header of requests that need authentication."
        );

        return message;

    }

    public Page<User> listUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public Page<User> findUser(String name, Pageable pageable) {
        return userRepository.findByNameContaining(name, pageable);
    }

    public Message createUser(UserDTO userDTO) {

        Optional<User> userIsPresent = userRepository.findByEmail(userDTO.getEmail());
        if (userIsPresent.isPresent() && userIsPresent.get().getActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "There is already a user with the email " + userDTO.getEmail());
        } else if (userIsPresent.isPresent() && !userIsPresent.get().getActive()) {
            userRepository.delete(userIsPresent.get());
        }

        User user = new User();

        BeanUtils.copyProperties(userDTO, user);
        user.setRole("USER");
        user.setPassword(encoder.encode(userDTO.getPassword()));
        user = userRepository.save(user);

        PermissionCode permissionCode = generationPermissionCode(user.getEmail());

        boolean asSendEmail = sendEmail(
                userDTO.getEmail(),
                "Product review_hub - activation code",
                "Your account activation code valid for 15 minutes is: " + permissionCode.getCode());

        if (asSendEmail) {

            Message message = new Message(
                    HttpStatus.CREATED.value(),
                    new Date(),
                    "Use the code that was sent to the email " + user.getEmail() + "to complete your registration.",
                    "Use the code that was sent to the email " + user.getEmail() + "to complete your registration."
            );
            return message;

        } else {
            userRepository.delete(user);
            permissionCodeRepository.delete(permissionCode);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to send code to email " + userDTO.getEmail());
        }
    }

    public Message completeRegistrationByCode(CodeRegistrationDTO codeRegistrationDTO) {

        Optional<User> user = userRepository.findByEmail(codeRegistrationDTO.getEmail());

        if (!user.isPresent()) {
            throw new NotFoundException("There is not even an addendum record for the email " + codeRegistrationDTO.getEmail());
        }
        if (user.get().getActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Completion of account registration has already been completed previously " + codeRegistrationDTO.getEmail());
        }

        Optional<PermissionCode> activationCode = permissionCodeRepository.findByCodeAndUser(codeRegistrationDTO.getCode(), user.get());
        if (!activationCode.isPresent()) {
            throw new NotFoundException("Invalid code or there is no activation code for the email: " + codeRegistrationDTO.getEmail());
        }
        if (System.currentTimeMillis() > activationCode.get().getCodeExpirationTime()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code entered is expired");
        }

        user.get().setActive(true);
        userRepository.save(user.get());
        permissionCodeRepository.delete(activationCode.get());

        Message message = new Message(
                HttpStatus.OK.value(),
                new Date(),
                "JWT token to be sent in the header of requests that need authentication.",
                "It is now possible to log in to make requests that need authentication."
        );

        return message;

    }

    public User updateUser(UserDTO userDTO) {

        User userLogged = getUserDataLogged();

        if (userDTO.getEmail() != null && !userDTO.getEmail().isEmpty()) {
            if (userRepository.findByEmail(userDTO.getEmail()).isPresent() && !userDTO.getEmail().equals(userLogged.getEmail())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This email is unavailable");
            } else {
                userLogged.setEmail(userDTO.getEmail());
            }
        }
        if (userDTO.getName() != null && !userDTO.getName().isEmpty()) {
            userLogged.setName(userDTO.getName());
        }
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            userLogged.setPassword(encoder.encode(userDTO.getPassword()));
        }
        if (userDTO.getProfileImage() != null) {

            if (userLogged.getProfileImageName() != null && !userLogged.getProfileImageName().isEmpty()) {
                try {
                    fileService.delete("uploads/img_user/" + userLogged.getProfileImageName());
                } catch (IOException e) {
                    e.printStackTrace();
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error deleting old image");
                }
            }

            try {
                String fileName = fileService.save(userDTO.getProfileImage(), "img_user");
                userLogged.setProfileImageName(fileName);
            } catch (IOException e) {
                e.printStackTrace();
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error saving new image");
            }

        }

        return userRepository.save(userLogged);

    }

    public void deleteAccount() {

        if (getUserDataLogged().getProfileImageName() != null && !getUserDataLogged().getProfileImageName().isEmpty()) {
            try {
                fileService.delete("uploads/img_user/" + getUserDataLogged().getProfileImageName());
            } catch (IOException e) {
                e.printStackTrace();
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error deleting image");
            }
        }

        userRepository.delete(getUserDataLogged());

    }

    /* admin or master permission is required */
    public void deleteAUser(String email) {

        Optional<User> user = userRepository.findByEmail(email);

        if (!user.isPresent()) {
            throw new NotFoundException("User with email " + email + " not found ");
        }

        if (getUserDataLogged().getRole().equals("MASTER") && user.get().getRole().equals("MASTER")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A master user cannot delete another master user.");
        } else if (getUserDataLogged().getRole().equals("ADMIN") && user.get().getRole().equals("MASTER")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A admin user cannot delete another master user.");
        } else if (getUserDataLogged().getRole().equals("ADMIN") && user.get().getRole().equals("ADMIN")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A admin user cannot delete another admin user.");
        }

        if (user.get().getProfileImageName() != null && !user.get().getProfileImageName().isEmpty()) {
            try {
                fileService.delete("uploads/img_user/" + user.get().getProfileImageName());
            } catch (IOException e) {
                e.printStackTrace();
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error deleting image");
            }
        }

        userRepository.delete(user.get());

    }

    /* admin or master permission is required */
    public User updateAUser(String email, UserDTO userDTO) {

        Optional<User> user = userRepository.findByEmail(email);

        if (!user.isPresent()) {
            throw new NotFoundException("Email user " + email + " not found");
        }

        if (getUserDataLogged().getRole().equals("MASTER") && user.get().getRole().equals("MASTER")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A master user cannot update another master user.");
        } else if (getUserDataLogged().getRole().equals("ADMIN") && user.get().getRole().equals("MASTER")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A admin user cannot update another master user.");
        } else if (getUserDataLogged().getRole().equals("ADMIN") && user.get().getRole().equals("ADMIN")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A admin user cannot update another admin user.");
        }

        if (userDTO.getEmail() != null && !userDTO.getEmail().isEmpty()) {

            Optional<User> exitUser = userRepository.findByEmail(userDTO.getEmail());

            if (exitUser.isPresent() && !exitUser.get().getEmail().equals(email)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This email is unavailable");
            } else {
                user.get().setEmail(userDTO.getEmail());
            }
        }
        if (userDTO.getName() != null && !userDTO.getName().isEmpty()) {
            user.get().setName(userDTO.getName());
        }
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.get().setPassword(encoder.encode(userDTO.getPassword()));
        }
        if ((userDTO.getRole() != null && !userDTO.getRole().isEmpty())) {
            if (getUserDataLogged().getRole().equals("MASTER")) {
                user.get().setRole(userDTO.getRole());
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only a master can change the authority of another account.");
            }
        }
        if (userDTO.getProfileImage() != null) {

            if (user.get().getProfileImageName() != null && !user.get().getProfileImageName().isEmpty()) {
                try {
                    fileService.delete("uploads/img_user/" + user.get().getProfileImageName());
                } catch (IOException e) {
                    e.printStackTrace();
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error deleting old image");
                }
            }

            try {
                String fileName = fileService.save(userDTO.getProfileImage(), "img_user");
                user.get().setProfileImageName(fileName);
            } catch (IOException e) {
                e.printStackTrace();
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error saving new image");
            }

        }

        return userRepository.save(user.get());

    }

    public User getUserDataLogged() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<User> userEntity = userRepository.findByEmail(auth.getName());
        return userEntity.get();
    }

    public Message sendEmailForgottenPassword(String email) {

        PermissionCode permissionCode = generationPermissionCode(email);
        boolean asSendEmail = sendEmail(
                email,
                "Product review_hub - Password reset code",
                "Your password reset code valid for 15 minutes is: " + permissionCode.getCode());

        if (asSendEmail) {

            Message message = new Message(
                    HttpStatus.CREATED.value(),
                    new Date(),
                    "Use the code that was sent to the email " + email + "to complete your registration.",
                    "The code that was sent to the email must be used through paht /api/auth/forgotten-password/change-password with the code, email and new password from the request body."
            );

            return message;

        } else {
            permissionCodeRepository.delete(permissionCode);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to send code to email " + email);
        }

    }

    public Message changeForgottenPassword(CodeChangeForgottenPasswordDTO changeForgottenPasswordDTO) {

        Optional<User> user = userRepository.findByEmail(changeForgottenPasswordDTO.getEmail());
        if (!user.isPresent()) {
            throw new NotFoundException("User with email not found: " + changeForgottenPasswordDTO.getEmail());
        }
        Optional<PermissionCode> recoveryCodeAndEmail = permissionCodeRepository.findByCodeAndUser(changeForgottenPasswordDTO.getRecoveryCode(), user.get());
        if (!recoveryCodeAndEmail.isPresent()) {
            throw new NotFoundException("There is no password recovery code for the email: " + changeForgottenPasswordDTO.getEmail());
        }
        if (System.currentTimeMillis() > recoveryCodeAndEmail.get().getCodeExpirationTime()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code entered is expired");
        }

        user.get().setPassword(encoder.encode(changeForgottenPasswordDTO.getNewPassword()));
        userRepository.save(user.get());
        permissionCodeRepository.delete(recoveryCodeAndEmail.get());

        Message message = new Message(
                HttpStatus.OK.value(),
                new Date(),
                "Updated password",
                "Password successfully updated, now it is possible to login to make requests that need authentication."
        );

        return message;

    }

    private PermissionCode generationPermissionCode(String email) {

        PermissionCode permissionCode = new PermissionCode();

        Optional<User> user = userRepository.findByEmail(email);
        if (!user.isPresent())
            throw new NotFoundException("Unable to find a user with the email: " + email);

        Optional<PermissionCode> codeIsPresent = permissionCodeRepository.findByUser(user.get());
        codeIsPresent.ifPresent(codeForActivationAndPasswordReset -> permissionCodeRepository.delete(codeForActivationAndPasswordReset));

        Long generatedCode = ThreadLocalRandom.current().nextLong(1000000, 2000000);
        /*permissionCode.setCode(generatedCode);*/
        permissionCode.setUser(user.get());
        permissionCode.setCodeExpirationTime(System.currentTimeMillis() + 900000);
        permissionCode = permissionCodeRepository.save(permissionCode);

        return permissionCode;

    }

    public boolean sendEmail(String email, String subject, String text) {

        try {

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("jeandson.developer@gmail.com");
            message.setTo(email);
            message.setSubject(subject);
            message.setText(text);
            emailSender.send(message);

            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }

    }

}
