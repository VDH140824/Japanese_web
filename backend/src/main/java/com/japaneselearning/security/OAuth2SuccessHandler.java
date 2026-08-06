package com.japaneselearning.security;

import com.japaneselearning.entity.Role;
import com.japaneselearning.entity.User;
import com.japaneselearning.entity.UserStatus;
import com.japaneselearning.repository.RoleRepository;
import com.japaneselearning.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    private final String frontendUrl;

    public OAuth2SuccessHandler(
            UserRepository userRepository,
            RoleRepository roleRepository,
            JwtService jwtService,
            @Value("${app.frontend.url:http://localhost:5173}") String frontendUrl) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtService = jwtService;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String picture = oAuth2User.getAttribute("picture");

        if (email == null || email.isBlank()) {
            getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/login?error=no_email");
            return;
        }

        User user = userRepository.findByEmail(email).map(existingUser -> {
            existingUser.setLastLogin(LocalDateTime.now());
            if (picture != null && !picture.isBlank()) {
                existingUser.setAvatarUrl(picture);
            }
            return userRepository.save(existingUser);
        }).orElseGet(() -> {
            Role userRole = roleRepository.findByRoleName("USER")
                    .orElseGet(() -> roleRepository.save(Role.builder()
                            .roleName("USER")
                            .description("Default user role")
                            .build()));

            String username = email;
            if (userRepository.existsByUsername(username)) {
                username = email.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 5);
            }

            User newUser = User.builder()
                    .role(userRole)
                    .username(username)
                    .email(email)
                    .passwordHash("{OAUTH2}" + UUID.randomUUID())
                    .avatarUrl(picture)
                    .status(UserStatus.ACTIVE)
                    .emailVerified(true)
                    .lastLogin(LocalDateTime.now())
                    .build();

            return userRepository.save(newUser);
        });

        String token = jwtService.generateToken(user.getUsername());
        String targetUrl = frontendUrl + "/oauth2/redirect?token=" + token;
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
