package com.review_hub.controllers;

import com.review_hub.dtos.*;
import com.review_hub.services.FileService;
import com.review_hub.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

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

    @Operation(summary = "Get authentication token | Authority: Permit All")
    @PostMapping("/login")
    public ResponseEntity<Object> login(@Valid @RequestBody LoginDTO loginDTO, BindingResult result) {

        if (result.hasErrors())
            return new ResponseEntity<>(result.getAllErrors().stream().map(DefaultMessageSourceResolvable::getDefaultMessage).collect(Collectors.toList()), HttpStatus.BAD_REQUEST);

        return userService.login(loginDTO);
    }

    @Operation(summary = "Get authenticated account data | Authority: ADMIN, MASTER, USER")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/account-data")
    public ResponseEntity<Object> getDataAccount() {
        return new ResponseEntity<>(userService.getUserDataLogged(), HttpStatus.OK);
    }

    @GetMapping(value = "/get-img/{fileName}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<Object> getFile(@PathVariable String fileName) {
        try {
            var img = fileService.load("uploads/img_user/" + fileName);
            if (img != null)
                return new ResponseEntity<>(img, HttpStatus.OK);
            else
                return new ResponseEntity<>("Image not found", HttpStatus.NOT_FOUND);
        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error loading image", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(
            summary = "Allow user to register | Authority: Permit All",
            description = "Start of user registration, after completing this initial step, an email with a registration completion code will be sent, this code must be used in /auth/complete-registration"
    )
    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> postUser(@Valid @RequestBody UserDTO userDTO, BindingResult result) {

        if (result.hasErrors())
            return new ResponseEntity<>(result.getAllErrors().stream().map(DefaultMessageSourceResolvable::getDefaultMessage).collect(Collectors.toList()), HttpStatus.BAD_REQUEST);

        return userService.createUser(userDTO);

    }

    @Operation(
            summary = "Confirm registration with code sent to email | Authority: Permit All",
            description = "Change registration already started to registration completed and account activated"
    )
    @PutMapping("/complete-registration")
    public ResponseEntity<Object> completeRegistrationByCode(@Valid @RequestBody CodeRegistrationDTO codeRegistrationDTO, BindingResult result) {

        if (result.hasErrors())
            return new ResponseEntity<>(result.getAllErrors().stream().map(DefaultMessageSourceResolvable::getDefaultMessage).collect(Collectors.toList()), HttpStatus.BAD_REQUEST);

        return userService.completeRegistrationByCode(codeRegistrationDTO);

    }

    @Operation(summary = "Fully update own account | Authority: ADMIN, MASTER, USER")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping(value = "/update", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> putAccount(@Valid @RequestBody UserDTO userDTO, BindingResult result) {

        if (result.hasErrors())
            return new ResponseEntity<>(result.getAllErrors().stream().map(DefaultMessageSourceResolvable::getDefaultMessage).collect(Collectors.toList()), HttpStatus.BAD_REQUEST);

        return userService.updateUser(userDTO);
    }

    @Operation(summary = "Fully update own account | Authority: ADMIN, MASTER, USER")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Object> putFormAccount(@Valid UserDTO userDTO, BindingResult result) {

        if (result.hasErrors())
            return new ResponseEntity<>(result.getAllErrors().stream().map(DefaultMessageSourceResolvable::getDefaultMessage).collect(Collectors.toList()), HttpStatus.BAD_REQUEST);

        return userService.updateUser(userDTO);

    }

    @Operation(summary = "Partially upgrade own account | Authority: ADMIN, MASTER, USER")
    @SecurityRequirement(name = "Bearer Authentication")
    @PatchMapping(value = "/update", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> patchAccount(@RequestBody UserDTO userDTO) {
        return userService.updateUser(userDTO);
    }

    @Operation(summary = "Partially upgrade own account | Authority: ADMIN, MASTER, USER")
    @SecurityRequirement(name = "Bearer Authentication")
    @PatchMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Object> patchFormAccount(@Valid UserDTO userDTO, BindingResult result) {
        return userService.updateUser(userDTO);
    }

    @Operation(summary = "Delete to own account | Authority: ADMIN, MASTER, USER")
    @SecurityRequirement(name = "Bearer Authentication")
    @DeleteMapping("/account-delete")
    public ResponseEntity<Object> deleteAccount() {
        return userService.deleteAccount();
    }

    @Operation(summary = "Send email code to change forgotten password | Authority: permit all")
    @PostMapping("/forgotten-password/send-email")
    public ResponseEntity<Object> sendEmail(@Valid @RequestBody EmailDTO emailDTO, BindingResult result) {

        if (result.hasErrors())
            return new ResponseEntity<>(result.getAllErrors().stream().map(DefaultMessageSourceResolvable::getDefaultMessage).collect(Collectors.toList()), HttpStatus.BAD_REQUEST);

        return userService.sendEmailForgottenPassword(emailDTO.getEmail());
    }

    @Operation(summary = "Change forgotten password using the code that was sent to the email | Authority: permit all")
    @PutMapping("/forgotten-password/change-password")
    public ResponseEntity<Object> changeForgottenPassword(@Valid @RequestBody CodeChangeForgottenPasswordDTO changeForgottenPasswordDTO, BindingResult result) {

        if (result.hasErrors())
            return new ResponseEntity<>(result.getAllErrors().stream().map(DefaultMessageSourceResolvable::getDefaultMessage).collect(Collectors.toList()), HttpStatus.BAD_REQUEST);

        return userService.changeForgottenPassword(changeForgottenPasswordDTO);
    }

    /* ---------------------- Admin and Master metods -----------------------------*/

    @Operation(summary = "Get list users | Authority: ADMIN, MASTER")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/list-users")
    public ResponseEntity<Object> getUsers(@PageableDefault(size = 30, sort = "name") Pageable pageable, @RequestParam(required = false) String name) {

        if (name != null)
            return userService.findUser(name, pageable);

        return userService.listUsers(pageable);
    }

    @Operation(summary = "Fully upgrade a user | Authority: ADMIN, MASTER",
            description = "ADMIN account can update a USER account, and MASTER account can update an ADMIN account or a USER account")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/update-a-user/{email}")
    public ResponseEntity<Object> putAUser(@PathVariable String email, @Valid @RequestBody UserDTO userDTO, BindingResult result) {

        if (result.hasErrors())
            return new ResponseEntity<>(result.getAllErrors().stream().map(DefaultMessageSourceResolvable::getDefaultMessage).collect(Collectors.toList()), HttpStatus.BAD_REQUEST);

        return userService.updateAUser(email, userDTO);
    }

    @Operation(
            summary = "Partially update a user | Authority: ADMIN, MASTER",
            description = "ADMIN account can update a USER account, and MASTER account can update an ADMIN account or a USER account"
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @PatchMapping("/update-a-user/{email}")
    public ResponseEntity<Object> patchAUser(@PathVariable String email, @RequestBody UserDTO userDTO) {
        return userService.updateAUser(email, userDTO);
    }

    @Operation(summary = "An admin or a master can delete another person's account | Authority: ADMIN, MASTER",
            description = "ADMIN account can delete a USER account, and MASTER account can delete an ADMIN account or a USER account"
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @DeleteMapping("/delete-a-user/{email}")
    public ResponseEntity<Object> deleteAUser(@PathVariable String email) {
        return userService.deleteAUser(email);
    }



}
