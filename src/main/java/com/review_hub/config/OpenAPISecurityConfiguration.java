package com.review_hub.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

//https://www.baeldung.com/openapi-jwt-authentication
//https://springdoc.org/v2/
@Configuration
@OpenAPIDefinition(
        info =@Info(
                title = "ReviewHub API",
                version = "1.0",
                contact = @Contact(
                        name = "Jeandson Barros", email = "jeandson.developer@gmail.com", url = "https://www.linkedin.com/in/jeandson-barros-1aa133221/"
                ),
                license = @License(
                        name = "Apache 2.0", url = "https://www.apache.org/licenses/LICENSE-2.0"
                ),
                termsOfService = "${tos.uri}",
                description = "API for product and service rating system"
        ),
        servers = @Server(
                url = "http://localhost:8080/",
                description = "Test"
        )
)
@SecurityScheme(
        name = "Bearer Authentication",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        scheme = "bearer"
)
public class OpenAPISecurityConfiguration {
}
