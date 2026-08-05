CREATE DATABASE IF NOT EXISTS japanese_learning
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE japanese_learning;

-- ==========================
-- ROLES
-- ==========================
CREATE TABLE roles (
    role_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

-- ==========================
-- USERS
-- ==========================
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    role_id BIGINT NOT NULL,

    username VARCHAR(50) NOT NULL UNIQUE,

    email VARCHAR(100) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    avatar_url VARCHAR(255),

    status ENUM(
        'ACTIVE',
        'INACTIVE',
        'LOCKED',
        'BANNED'
    ) DEFAULT 'ACTIVE',

    email_verified BOOLEAN DEFAULT FALSE,

    last_login DATETIME NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_role
        FOREIGN KEY(role_id)
        REFERENCES roles(role_id)
);

-- ==========================
-- USER PROFILE
-- ==========================
CREATE TABLE user_profiles (

    profile_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT NOT NULL UNIQUE,

    full_name VARCHAR(100),

    birthday DATE,

    gender ENUM(
        'MALE',
        'FEMALE',
        'OTHER'
    ),

    country VARCHAR(100),

    native_language VARCHAR(50),

    japanese_level ENUM(
        'N5',
        'N4',
        'N3',
        'N2',
        'N1'
    ),

    bio TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_profile_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- ==========================
-- REFRESH TOKENS
-- ==========================
CREATE TABLE refresh_tokens (

    token_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT NOT NULL,

    token VARCHAR(512) NOT NULL,

    expires_at DATETIME NOT NULL,

    revoked BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- ==========================
-- EMAIL VERIFICATION
-- ==========================
CREATE TABLE email_verifications (

    verification_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT NOT NULL,

    verification_code VARCHAR(255) NOT NULL,

    expires_at DATETIME NOT NULL,

    verified BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_verify_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- ==========================
-- PASSWORD RESET
-- ==========================
CREATE TABLE password_resets (

    reset_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT NOT NULL,

    reset_token VARCHAR(255) NOT NULL,

    expires_at DATETIME NOT NULL,

    used BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reset_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- ==========================
-- LOGIN HISTORY
-- ==========================
CREATE TABLE login_history (

    login_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT NOT NULL,

    login_time DATETIME NOT NULL,

    logout_time DATETIME,

    ip_address VARCHAR(45),

    device VARCHAR(255),

    browser VARCHAR(255),

    success BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_login_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- ==========================
-- DEFAULT ROLES
-- ==========================
INSERT INTO roles(role_name, description)
VALUES
('ADMIN','System Administrator'),
('USER','Normal User');