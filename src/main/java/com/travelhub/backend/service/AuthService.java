package com.travelhub.backend.service;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.UnauthorizedException;
import com.travelhub.backend.dto.request.LoginRequest;
import com.travelhub.backend.dto.request.RegisterRequest;
import com.travelhub.backend.dto.response.AuthResponse;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // ── Register ──────────────────────────────────────────────
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email()))
            throw new BadRequestException("Email already registered");

        Role role = Role.TOURIST;
        try {
            if (request.role() != null)
                role = Role.valueOf(request.role().toUpperCase());
        } catch (Exception ignored) {}

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .telephone(request.telephone())
                .role(role)
                .isActive(true)
                // ✅ Agent → false, Others → true
                .agentApproved(role != Role.AGENT)
                .build();

        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getEmail());

        return new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    // ── Login ─────────────────────────────────────────────────
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() ->
                        new UnauthorizedException(
                                "Invalid email or password"));

        // ✅ Password check
        if (!passwordEncoder.matches(
                request.password(), user.getPassword()))
            throw new UnauthorizedException(
                    "Invalid email or password");

        // ✅ Account active check
        if (!user.getIsActive())
            throw new UnauthorizedException(
                    "Your account has been deactivated. " +
                            "Please contact admin.");

        // ✅ Agent approval check — இது புதிதாக சேர்க்கிறோம்
        if (user.getRole() == Role.AGENT
                && !user.getAgentApproved()) {
            throw new UnauthorizedException(
                    "Your agent account is pending approval. " +
                            "Please wait for admin to approve.");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail());

        return new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}
