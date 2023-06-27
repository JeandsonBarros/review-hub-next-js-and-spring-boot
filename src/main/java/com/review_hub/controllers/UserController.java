package com.review_hub.controllers;

import com.review_hub.dtos.*;
import com.review_hub.models.Message;
import com.review_hub.models.User;
import com.review_hub.services.FileService;
import com.review_hub.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.webjars.NotFoundException;

import javax.swing.text.html.HTML;
import java.io.IOException;
import java.util.stream.Collectors;

@CrossOrigin
@RestController
@RequestMapping("/api/auth/")
@Tag(name = "Auth")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private FileService fileService;

    @ApiResponse(responseCode = "201")
    @Operation(summary = "Get authentication token | Authority: Permit All")
    @PostMapping("/login")
    public ResponseEntity<Message> login(@Valid @RequestBody LoginDTO loginDTO) {
        return new ResponseEntity<>(userService.login(loginDTO), HttpStatus.CREATED);
    }

    @ApiResponse(responseCode = "200")
    @Operation(summary = "Get authenticated account data | Authority: ADMIN, MASTER, USER")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/account-data")
    public ResponseEntity<User> getDataAccount() {
        return new ResponseEntity<>(userService.getUserDataLogged(), HttpStatus.OK);
    }

    @GetMapping(value = "/get-img/{fileName}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> getFile(@PathVariable String fileName) {
        try {
            var img = fileService.load("uploads/img_user/" + fileName);
            if (img != null)
                return new ResponseEntity<>(img, HttpStatus.OK);
            else
                throw new NotFoundException("Image not found");
        } catch (IOException e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error loading image");
        }
    }

    @ApiResponse(responseCode = "201")
    @Operation(
            summary = "Allow user to register | Authority: Permit All",
            description = "Start of user registration, after completing this initial step, an email with a registration completion code will be sent, this code must be used in /auth/complete-registration"
    )
    @PostMapping(value = "/start-registration", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Message> postUser(@Valid @RequestBody UserDTO userDTO) {
        return new ResponseEntity<>(userService.createUser(userDTO), HttpStatus.CREATED);
    }

    @ApiResponse(responseCode = "200")
    @Operation(
            summary = "Confirm registration with code sent to email | Authority: Permit All",
            description = "Change registration already started to registration completed and account activated"
    )
    @PutMapping("/complete-registration")
    public ResponseEntity<Message> completeRegistrationByCode(@Valid @RequestBody CodeRegistrationDTO codeRegistrationDTO) {
        return new ResponseEntity<>(userService.completeRegistrationByCode(codeRegistrationDTO), HttpStatus.OK);
    }

    @ApiResponse(responseCode = "200")
    @Operation(summary = "Fully update own account | Authority: ADMIN, MASTER, USER")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping(value = "/update", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<User> putAccount(@Valid @RequestBody UserDTO userDTO) {
        return new ResponseEntity<>(userService.updateUser(userDTO), HttpStatus.OK);
    }

    @ApiResponse(responseCode = "200")
    @Operation(summary = "Fully update own account | Authority: ADMIN, MASTER, USER")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<User> putFormAccount(@Valid UserDTO userDTO) {
        return new ResponseEntity<>(userService.updateUser(userDTO), HttpStatus.OK);
    }

    @ApiResponse(responseCode = "200")
    @Operation(summary = "Partially upgrade own account | Authority: ADMIN, MASTER, USER")
    @SecurityRequirement(name = "Bearer Authentication")
    @PatchMapping(value = "/update", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<User> patchAccount(@RequestBody UserDTO userDTO) {
        return new ResponseEntity<>(userService.updateUser(userDTO), HttpStatus.OK);
    }

    @ApiResponse(responseCode = "200")
    @Operation(summary = "Partially upgrade own account | Authority: ADMIN, MASTER, USER")
    @SecurityRequirement(name = "Bearer Authentication")
    @PatchMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<User> patchFormAccount(@Valid UserDTO userDTO, BindingResult result) {
        return new ResponseEntity<>(userService.updateUser(userDTO), HttpStatus.OK);
    }

    @ApiResponse(responseCode = "204")
    @Operation(summary = "Delete to own account | Authority: ADMIN, MASTER, USER")
    @SecurityRequirement(name = "Bearer Authentication")
    @DeleteMapping("/account-delete")
    public ResponseEntity<Void> deleteAccount() {
        userService.deleteAccount();
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @ApiResponse(responseCode = "201")
    @Operation(summary = "Send email code to change forgotten password | Authority: permit all")
    @PostMapping("/forgotten-password/send-email")
    public ResponseEntity<Message> sendEmail(@Valid @RequestBody EmailDTO emailDTO) {
        return new ResponseEntity<>(userService.sendEmailForgottenPassword(emailDTO.getEmail()), HttpStatus.CREATED);
    }

    @ApiResponse(responseCode = "200")
    @Operation(summary = "Change forgotten password using the code that was sent to the email | Authority: permit all")
    @PutMapping("/forgotten-password/change-password")
    public ResponseEntity<Message> changeForgottenPassword(@Valid @RequestBody CodeChangeForgottenPasswordDTO changeForgottenPasswordDTO) {
        return new ResponseEntity<>(userService.changeForgottenPassword(changeForgottenPasswordDTO), HttpStatus.OK);
    }

    /* ---------------------- Admin and Master metods -----------------------------*/

    @ApiResponse(responseCode = "200")
    @Operation(summary = "Get list users | Authority: ADMIN, MASTER")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/list-users")
    public ResponseEntity<Page<User>> getUsers(@PageableDefault(size = 30, sort = "name") Pageable pageable, @RequestParam(required = false) String name) {

        if (name != null) {
            return new ResponseEntity<>(userService.findUser(name, pageable), HttpStatus.OK);
        }

        return new ResponseEntity<>(userService.listUsers(pageable), HttpStatus.OK);
    }

    @ApiResponse(responseCode = "200")
    @Operation(summary = "Fully upgrade a user | Authority: ADMIN, MASTER",
            description = "ADMIN account can update a USER account, and MASTER account can update an ADMIN account or a USER account")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/update-a-user/{email}")
    public ResponseEntity<User> putAUser(@PathVariable String email, @Valid @RequestBody UserDTO userDTO) {
        return new ResponseEntity<>(userService.updateAUser(email, userDTO), HttpStatus.OK);
    }

    @ApiResponse(responseCode = "200")
    @Operation(
            summary = "Partially update a user | Authority: ADMIN, MASTER",
            description = "ADMIN account can update a USER account, and MASTER account can update an ADMIN account or a USER account"
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @PatchMapping("/update-a-user/{email}")
    public ResponseEntity<User> patchAUser(@PathVariable String email, @RequestBody UserDTO userDTO) {
        return new ResponseEntity<>(userService.updateAUser(email, userDTO), HttpStatus.OK);
    }

    @ApiResponse(responseCode = "204")
    @Operation(summary = "An admin or a master can delete another person's account | Authority: ADMIN, MASTER",
            description = "ADMIN account can delete a USER account, and MASTER account can delete an ADMIN account or a USER account"
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @DeleteMapping("/delete-a-user/{email}")
    public ResponseEntity<Void> deleteAUser(@PathVariable String email) {
        userService.deleteAUser(email);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

}
