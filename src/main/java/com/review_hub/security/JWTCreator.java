package com.review_hub.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JWTCreator {

    @Value("${security.token.config.prefix}")
    private String prefix/* = "Bearer"*/;
    @Value("${security.token.config.key}")
    private String key/* = "463408a1-54c9-4307-bb1c-6cced559f5a7"*/;
    @Value("${security.token.config.expiration}")
    private Long expiration/* = 3600000L*/;

    //Creates the String token that will be sent to the user
    public String create(JWTObject jwtObject) {

        try {

            String token = JWT.create()
                    .withSubject(jwtObject.getSubject())
                    /*.withIssuedAt(jwtObject.getIssuedAt())*/
                    .withClaim("userId", jwtObject.getUserId())
                    .withClaim("authorities", jwtObject.getRole())
                    /*.withExpiresAt(expiration)*/
                    .sign(Algorithm.HMAC512(key));

            return prefix + " " + token;

        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    //passes String token data to a JWTObject object
    public JWTObject create(String token) throws Exception {

        token = token.substring(7, token.length());

        JWTObject object = new JWTObject();

        var dataToken = JWT.require(Algorithm.HMAC512(key)).build().verify(token).getClaims();

        object.setSubject(dataToken.get("sub").asString());
        /*object.setExpiration(new Date(Long.parseLong(dataToken.get("exp").toString())));*/
        /*object.setIssuedAt(new Date(Long.parseLong(dataToken.get("iat").toString())));*/
        object.setUserId(Long.parseLong(dataToken.get("userId").toString()));
        object.setRole(dataToken.get("authorities").toString());

        return object;

    }

}
