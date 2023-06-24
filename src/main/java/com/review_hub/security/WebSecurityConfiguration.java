package com.review_hub.security;

import com.review_hub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class WebSecurityConfiguration {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JWTCreator jwtCreator;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors().and().csrf().disable()
                .addFilterAfter(new JWTFilter(userRepository, jwtCreator), UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests()
                .requestMatchers("/").permitAll()
                .requestMatchers(HttpMethod.GET,"/api/product/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/product/**").hasAnyAuthority("ADMIN", "MASTER")
                .requestMatchers(HttpMethod.PATCH, "/api/product/**").hasAnyAuthority("ADMIN", "MASTER")
                .requestMatchers(HttpMethod.DELETE, "/api/product/**").hasAnyAuthority("ADMIN", "MASTER")
                .requestMatchers(HttpMethod.PUT, "/api/product/**").hasAnyAuthority("ADMIN", "MASTER")
                .requestMatchers("/api/auth/forgotten-password/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auth/get-img/{fileName}").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/auth/complete-registration").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auth/list-users").hasAnyAuthority("ADMIN", "MASTER")
                .requestMatchers(HttpMethod.DELETE, "/api/auth/delete-a-user/{email}").hasAnyAuthority( "ADMIN", "MASTER")
                .requestMatchers(HttpMethod.PATCH, "/api/auth/update-a-user/{email}").hasAnyAuthority( "ADMIN", "MASTER")
                .requestMatchers(HttpMethod.PUT, "/api/auth/update-a-user/{email}").hasAnyAuthority( "ADMIN", "MASTER")
                .requestMatchers(HttpMethod.GET, "/api/review/{productId}/**").permitAll()
                .anyRequest().authenticated()
                .and()
                .cors()
                .configurationSource(corsConfigurationSource());

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedMethods(List.of(
                HttpMethod.GET.name(),
                HttpMethod.PUT.name(),
                HttpMethod.POST.name(),
                HttpMethod.DELETE.name(),
                HttpMethod.PATCH.name()
        ));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration.applyPermitDefaultValues());
        return source;
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers(
                "/v3/api-docs/**",
                "/swagger.json/**",
                "/swagger-ui/**"
        );
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
