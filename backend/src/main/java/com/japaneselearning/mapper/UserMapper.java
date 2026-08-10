package com.japaneselearning.mapper;

import com.japaneselearning.dto.request.RegisterRequest;
import com.japaneselearning.dto.response.UserResponse;
import com.japaneselearning.entity.User;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }

        UserResponse response = new UserResponse();
        response.setId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setStatus(user.getStatus() != null ? user.getStatus().name() : null);
        response.setEmailVerified(user.getEmailVerified());
        response.setRole(user.getRole() != null ? user.getRole().getRoleName() : null);
        response.setLastLogin(user.getLastLogin());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }

    public static User toEntity(RegisterRequest request) {
        if (request == null) {
            return null;
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        return user;
    }
}
