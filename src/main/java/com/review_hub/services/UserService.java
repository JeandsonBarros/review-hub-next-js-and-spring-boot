package com.review_hub.services;

import com.review_hub.dtos.CodeChangeForgottenPasswordDTO;
import com.review_hub.dtos.CodeRegistrationDTO;
import com.review_hub.dtos.LoginDTO;
import com.review_hub.dtos.UserDTO;
import com.review_hub.models.CodeForActivationAndPasswordReset;
import com.review_hub.models.User;
import com.review_hub.repository.CodeForActivationAndPasswordResetRepository;
import com.review_hub.repository.UserRepository;
import com.review_hub.security.JWTCreator;
import com.review_hub.security.JWTObject;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
    private CodeForActivationAndPasswordResetRepository codeForActivationAndPasswordRepository;
    @Autowired
    private FileService fileService;

    public ResponseEntity<Object> login(LoginDTO loginDTO) {

        try {

            Optional<User> user = userRepository.findByEmail(loginDTO.getEmail());

            if (user.isPresent()) {

                boolean passwordOk = encoder.matches(loginDTO.getPassword(), user.get().getPassword());
                if (!passwordOk) {
                    return new ResponseEntity<>("Incorrect password for email: " + loginDTO.getEmail(), HttpStatus.UNAUTHORIZED);
                }

                if (!user.get().getActive()) {
                    return new ResponseEntity<>("The registration of this account has not been completed, use the code that was sent to the email " + loginDTO.getEmail() + " to complete the registration.", HttpStatus.UNAUTHORIZED);
                }

                JWTObject jwtObject = new JWTObject();
                jwtObject.setSubject(user.get().getEmail());
                jwtObject.setUserId(user.get().getId());
                jwtObject.setIssuedAt(new Date(System.currentTimeMillis()));
                jwtObject.setRole(user.get().getRole());

                return new ResponseEntity<>(jwtCreator.create(jwtObject), HttpStatus.CREATED);

            } else {
                return new ResponseEntity<>("User with email '" + loginDTO.getEmail() + "' not found", HttpStatus.NOT_FOUND);
            }

        } catch (Exception e) {
            return new ResponseEntity<>("Login error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Object> listUsers(Pageable pageable) {
        try {
            return new ResponseEntity<>(userRepository.findAll(pageable), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error listing users", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Object> findUser(String name, Pageable pageable) {
        try {
            return new ResponseEntity<>(userRepository.findByNameContaining(name, pageable), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error fetching user", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Object> createUser(UserDTO userDTO) {

        User user = new User();

        try {

            Optional<User> userIsPresent = userRepository.findByEmail(userDTO.getEmail());
            if (userIsPresent.isPresent() && userIsPresent.get().getActive())
                return new ResponseEntity<>("There is already a user with the email " + userDTO.getEmail(), HttpStatus.BAD_REQUEST);
            if (userIsPresent.isPresent() && !userIsPresent.get().getActive())
                userRepository.delete(userIsPresent.get());

            BeanUtils.copyProperties(userDTO, user);
            user.setRole("USER");
            user.setPassword(encoder.encode(userDTO.getPassword()));
            user = userRepository.save(user);

            return sendEmailWithCode(userDTO.getEmail(), "Product review_hub - activation code", "Your account activation code valid for 15 minutes is: ");

        } catch (Exception e) {
            userRepository.delete(user);
            return new ResponseEntity<>("Error when registering.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Object> completeRegistrationByCode(CodeRegistrationDTO codeRegistrationDTO) {

        try {

            Optional<User> user = userRepository.findByEmail(codeRegistrationDTO.getEmail());

            if (!user.isPresent())
                return new ResponseEntity<>("There is not even an addendum record for the email " + codeRegistrationDTO.getEmail(), HttpStatus.NOT_FOUND);

            if (user.get().getActive())
                return new ResponseEntity<>("Completion of account registration has already been completed previously " + codeRegistrationDTO.getEmail(), HttpStatus.BAD_REQUEST);

            Optional<CodeForActivationAndPasswordReset> activationCode = codeForActivationAndPasswordRepository.findByRecoveryCodeAndUser(codeRegistrationDTO.getCode(), user.get());
            if (!activationCode.isPresent())
                return new ResponseEntity<>("There is no activation code for the email: " + codeRegistrationDTO.getEmail(), HttpStatus.NOT_FOUND);

            if (System.currentTimeMillis() > activationCode.get().getCodeExpirationTime())
                return new ResponseEntity<>("Code entered is expired", HttpStatus.BAD_REQUEST);

            if (Objects.equals(codeRegistrationDTO.getCode(), activationCode.get().getRecoveryCode())) {
                user.get().setActive(true);
                userRepository.save(user.get());
                codeForActivationAndPasswordRepository.delete(activationCode.get());
                return new ResponseEntity<>("Registration completed successfully", HttpStatus.OK);
            } else {
                return new ResponseEntity<>("Invalid code", HttpStatus.BAD_REQUEST);
            }

        } catch (Exception e) {
            return new ResponseEntity<>("Error completing registration", HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    public ResponseEntity<Object> updateUser(UserDTO userDTO) {
        try {

            User userLogged = getUserDataLogged();

            if (userDTO.getEmail() != null && !userDTO.getEmail().isEmpty()) {
                if (userRepository.findByEmail(userDTO.getEmail()).isPresent() && !userDTO.getEmail().equals(userLogged.getEmail())) {
                    return new ResponseEntity<>("This email is unavailable", HttpStatus.BAD_REQUEST);
                } else {
                    userLogged.setEmail(userDTO.getEmail());
                }
            }
            if (userDTO.getName() != null && !userDTO.getName().isEmpty())
                userLogged.setName(userDTO.getName());

            if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty())
                userLogged.setPassword(encoder.encode(userDTO.getPassword()));

            if (userDTO.getProfileImage() != null) {
                if (userLogged.getProfileImageName() != null && !userLogged.getProfileImageName().isEmpty())
                    fileService.delete("uploads/img_user/" + userLogged.getProfileImageName());

                String fileName = fileService.save(userDTO.getProfileImage(), "img_user");
                userLogged.setProfileImageName(fileName);
            }

            userRepository.save(userLogged);

            return new ResponseEntity<>("Successfully updated", HttpStatus.OK);

        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error updating user image", HttpStatus.INTERNAL_SERVER_ERROR);
        }  catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error updating account", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Object> deleteAccount() {
        try {
            if (getUserDataLogged().getProfileImageName() != null && !getUserDataLogged().getProfileImageName().isEmpty())
                fileService.delete("uploads/img_user/" + getUserDataLogged().getProfileImageName());

            userRepository.delete(getUserDataLogged());
            return new ResponseEntity<>("account deleted", HttpStatus.OK);

        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error deleting user image", HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error deleting account", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /* admin or master permission is required */
    public ResponseEntity<Object> deleteAUser(String email) {
        try {

            Optional<User> user = userRepository.findByEmail(email);

            if (!user.isPresent())
                return new ResponseEntity<>("User with email " + email + " not found ", HttpStatus.NOT_FOUND);

            if (getUserDataLogged().getRole().equals("MASTER") && user.get().getRole().equals("MASTER")) {
                return new ResponseEntity<>("A master user cannot delete another master user.", HttpStatus.BAD_REQUEST);
            } else if (getUserDataLogged().getRole().equals("ADMIN") && user.get().getRole().equals("MASTER")) {
                return new ResponseEntity<>("A admin user cannot delete another master user.", HttpStatus.BAD_REQUEST);
            } else if (getUserDataLogged().getRole().equals("ADMIN") && user.get().getRole().equals("ADMIN")) {
                return new ResponseEntity<>("A admin user cannot delete another admin user.", HttpStatus.NOT_FOUND);
            }
            if (user.get().getProfileImageName() != null && !user.get().getProfileImageName().isEmpty())
                fileService.delete("uploads/img_user/" + user.get().getProfileImageName());

            userRepository.delete(user.get());
            return new ResponseEntity<>("account with email " + email + " deleted", HttpStatus.OK);

        }  catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error deleting user image", HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error deleting user", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /* admin or master permission is required */
    public ResponseEntity<Object> updateAUser(String email, UserDTO userDTO) {
        try {

            Optional<User> user = userRepository.findByEmail(email);

            if (!user.isPresent())
                return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);

            if (getUserDataLogged().getRole().equals("MASTER") && user.get().getRole().equals("MASTER")) {
                return new ResponseEntity<>("A master user cannot update another master user.", HttpStatus.NOT_FOUND);
            } else if (getUserDataLogged().getRole().equals("ADMIN") && user.get().getRole().equals("MASTER")) {
                return new ResponseEntity<>("A admin user cannot update another master user.", HttpStatus.NOT_FOUND);
            } else if (getUserDataLogged().getRole().equals("ADMIN") && user.get().getRole().equals("ADMIN")) {
                return new ResponseEntity<>("A admin user cannot update another admin user.", HttpStatus.NOT_FOUND);
            }

            if (userDTO.getEmail() != null && !userDTO.getEmail().isEmpty()) {

                Optional<User> exitUser = userRepository.findByEmail(userDTO.getEmail());

                if (exitUser.isPresent() && !exitUser.get().getEmail().equals(email)) {
                    return new ResponseEntity<>("This email is unavailable", HttpStatus.BAD_REQUEST);
                } else {
                    user.get().setEmail(userDTO.getEmail());
                }
            }

            if (userDTO.getName() != null && !userDTO.getName().isEmpty())
                user.get().setName(userDTO.getName());

            if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty())
                user.get().setPassword(encoder.encode(userDTO.getPassword()));

            if ((userDTO.getRole() != null && !userDTO.getRole().isEmpty())) {
                if (getUserDataLogged().getRole().equals("MASTER"))
                    user.get().setRole(userDTO.getRole());
                else
                    return new ResponseEntity<>("Only a master can change the authority of another account.", HttpStatus.NOT_FOUND);
            }

            if (userDTO.getProfileImage() != null) {
                if (user.get().getProfileImageName() != null && !user.get().getProfileImageName().isEmpty())
                    fileService.delete("uploads/img_user/" + user.get().getProfileImageName());

                String fileName = fileService.save(userDTO.getProfileImage(), "img_user");
                user.get().setProfileImageName(fileName);
            }

            userRepository.save(user.get());

            return new ResponseEntity<>("Successfully updated", HttpStatus.OK);

        }  catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error updating user image", HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error updating user", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public User getUserDataLogged() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<User> userEntity = userRepository.findByEmail(auth.getName());
        return userEntity.get();
    }

    public ResponseEntity<Object> sendEmailForgottenPassword(String email) {
        return sendEmailWithCode(email, "Product review_hub - Password reset code", "Your password reset code valid for 15 minutes is: ");
    }

    public ResponseEntity<Object> changeForgottenPassword(CodeChangeForgottenPasswordDTO changeForgottenPasswordDTO) {

        try {

            Optional<User> user = userRepository.findByEmail(changeForgottenPasswordDTO.getEmail());
            if (!user.isPresent())
                return new ResponseEntity<>("User with email not found: " + changeForgottenPasswordDTO.getEmail(), HttpStatus.NOT_FOUND);

            Optional<CodeForActivationAndPasswordReset> recoveryCodeAndEmail = codeForActivationAndPasswordRepository.findByRecoveryCodeAndUser(changeForgottenPasswordDTO.getRecoveryCode(), user.get());
            if (!recoveryCodeAndEmail.isPresent())
                return new ResponseEntity<>("There is no password recovery code for the email: " + changeForgottenPasswordDTO.getEmail(), HttpStatus.NOT_FOUND);

            if (System.currentTimeMillis() > recoveryCodeAndEmail.get().getCodeExpirationTime())
                return new ResponseEntity<>("Code entered is expired", HttpStatus.BAD_REQUEST);

            user.get().setPassword(encoder.encode(changeForgottenPasswordDTO.getNewPassword()));
            userRepository.save(user.get());
            codeForActivationAndPasswordRepository.delete(recoveryCodeAndEmail.get());

            return new ResponseEntity<>("Updated password", HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    /* It generates a code to activate the account or reset the password and send it to the user's email. */
    public ResponseEntity<Object> sendEmailWithCode(String email, String subject, String text) {

        CodeForActivationAndPasswordReset codeEntity = new CodeForActivationAndPasswordReset();

        try {

            Optional<User> user = userRepository.findByEmail(email);
            if (!user.isPresent())
                return new ResponseEntity<>("Unable to find a user with the email: " + email, HttpStatus.NOT_FOUND);

            Optional<CodeForActivationAndPasswordReset> codeIsPresent = codeForActivationAndPasswordRepository.findByUser(user.get());
            codeIsPresent.ifPresent(codeForActivationAndPasswordReset -> codeForActivationAndPasswordRepository.delete(codeForActivationAndPasswordReset));

            Long generatedCode = ThreadLocalRandom.current().nextLong(1000000, 2000000);
            codeEntity.setRecoveryCode(generatedCode);
            codeEntity.setUser(user.get());
            codeEntity.setCodeExpirationTime(System.currentTimeMillis() + 900000);
            codeEntity = codeForActivationAndPasswordRepository.save(codeEntity);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("jeandson.developer@gmail.com");
            message.setTo(email);
            message.setSubject(subject);
            message.setText(text + generatedCode);
            emailSender.send(message);

            return new ResponseEntity<>("Use the code that was sent to the email " + email + ".", HttpStatus.CREATED);

        } catch (Exception e) {
            codeForActivationAndPasswordRepository.delete(codeEntity);
            e.printStackTrace();
            return new ResponseEntity<>("Unable to send code to email " + email, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

}
