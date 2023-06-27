package com.review_hub.exception;

public class UnauthorizedExceptionsHandler extends RuntimeException{
    public UnauthorizedExceptionsHandler(String message){
        super(message);
    }
}
