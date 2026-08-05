package main.java.com.japaneselearning.mapper;

import main.java.com.japaneselearning.dto.request.RefreshTokenRequest;
import main.java.com.japaneselearning.entity.RefreshToken;

public final class RefreshTokenMapper {

    private RefreshTokenMapper() {
    }

    public static RefreshToken toEntity(RefreshTokenRequest request) {
        if (request == null) {
            return null;
        }

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(request.getRefreshToken());
        return refreshToken;
    }
}