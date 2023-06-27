package com.review_hub.exception;

import com.review_hub.models.Message;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ResponseStatusException;
import org.webjars.NotFoundException;

import java.util.Date;

@RestControllerAdvice
public class ControllerExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(value = HttpStatus.NOT_FOUND)
    public Message resourceNotFoundException(NotFoundException ex, WebRequest request) {

        Message message = new Message(
                HttpStatus.NOT_FOUND.value(),
                new Date(),
                ex.getMessage(),
                request.getDescription(false));

        return message;
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Message handleValidationExceptions(MethodArgumentNotValidException ex, WebRequest request) {

        Message message = new Message(
                HttpStatus.BAD_REQUEST.value(),
                new Date(),
                ex.getBindingResult().getAllErrors().get(0).getDefaultMessage(),
                request.getDescription(false));

        return message;
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(value = ResponseStatusException.class)
    public Message globalBadRequestExceptionsHandler(ResponseStatusException ex, WebRequest request) {

        Message message = new Message(
                HttpStatus.BAD_REQUEST.value(),
                new Date(),
                ex.getReason(),
                request.getDescription(false));

        return message;
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler(value = UnauthorizedExceptionsHandler.class)
    public Message unauthorizedExceptionsHandler(UnauthorizedExceptionsHandler ex, WebRequest request) {

        Message message = new Message(
                HttpStatus.UNAUTHORIZED.value(),
                new Date(),
                ex.getMessage(),
                request.getDescription(false));

        return message;
    }

    @ExceptionHandler(value = Exception.class)
    @ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
    public Message globalExceptionHandler(Exception ex, WebRequest request) {
        ex.printStackTrace();
        Message message = new Message(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                new Date(),
                "Internal server error",
                request.getDescription(false));

        return message;
    }

}
