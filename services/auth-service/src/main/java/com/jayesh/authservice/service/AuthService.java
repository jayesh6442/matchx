package com.jayesh.authservice.service;

import com.jayesh.authservice.dto.AuthResponse;
import com.jayesh.authservice.dto.LoginRequest;
import com.jayesh.authservice.dto.RegisterRequest;
import com.jayesh.authservice.dto.UserResponse;
import com.jayesh.authservice.exception.ConflictException;
import com.jayesh.authservice.exception.UnauthorizedException;
import com.jayesh.authservice.model.UserEntity;
import com.jayesh.authservice.repository.UserRepository;
import com.jayesh.authservice.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered");
        }

        UserEntity user = new UserEntity();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");

        UserEntity saved = userRepository.save(user);
        logger.info("event=user_registered userId={} email={}", saved.getId(), saved.getEmail());

        return new UserResponse(saved.getId(), saved.getEmail(), saved.getRole(), saved.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        UserEntity user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        logger.info("event=user_logged_in userId={} email={}", user.getId(), user.getEmail());

        return new AuthResponse(token, "Bearer", jwtService.getExpirationSeconds());
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        return new UserResponse(user.getId(), user.getEmail(), user.getRole(), user.getCreatedAt());
    }
}
