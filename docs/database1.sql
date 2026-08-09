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


-- =========================================================
-- VIDEO ENTERTAINMENT MODULE
-- =========================================================

-- =========================================================
-- 1. VIDEO CATEGORIES
-- =========================================================
CREATE TABLE video_categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- 2. VIDEOS
-- =========================================================
CREATE TABLE videos (
    video_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT NOT NULL,
    category_id BIGINT,

    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Cloudinary information
    video_url VARCHAR(1000) NOT NULL,
    cloudinary_public_id VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(1000),

    -- Japanese learning level
    jlpt_level VARCHAR(10),

    -- Moderation status
    status ENUM('PENDING', 'APPROVED', 'REJECTED')
        NOT NULL DEFAULT 'PENDING',

    rejection_reason VARCHAR(500),

    view_count BIGINT NOT NULL DEFAULT 0,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_videos_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    CONSTRAINT fk_videos_category
        FOREIGN KEY (category_id)
        REFERENCES video_categories(category_id)
);


-- =========================================================
-- 3. VIDEO TAGS
-- =========================================================
CREATE TABLE video_tags (
    tag_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tag_name VARCHAR(100) NOT NULL UNIQUE
);


-- =========================================================
-- 4. VIDEO - TAG RELATIONSHIP
-- =========================================================
CREATE TABLE video_tag_mapping (
    video_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,

    PRIMARY KEY (video_id, tag_id),

    CONSTRAINT fk_video_tag_mapping_video
        FOREIGN KEY (video_id)
        REFERENCES videos(video_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_video_tag_mapping_tag
        FOREIGN KEY (tag_id)
        REFERENCES video_tags(tag_id)
        ON DELETE CASCADE
);


-- =========================================================
-- 5. VIDEO VIEWS
-- =========================================================
CREATE TABLE video_views (
    view_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    video_id BIGINT NOT NULL,
    user_id BIGINT NULL,

    viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_video_views_video
        FOREIGN KEY (video_id)
        REFERENCES videos(video_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_video_views_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL
);


-- =========================================================
-- 6. VIDEO LIKES
-- =========================================================
CREATE TABLE video_likes (
    video_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (video_id, user_id),

    CONSTRAINT fk_video_likes_video
        FOREIGN KEY (video_id)
        REFERENCES videos(video_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_video_likes_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


-- =========================================================
-- 7. VIDEO COMMENTS
-- =========================================================
CREATE TABLE video_comments (
    comment_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    video_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,

    content TEXT NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_video_comments_video
        FOREIGN KEY (video_id)
        REFERENCES videos(video_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_video_comments_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


-- =========================================================
-- 8. VIDEO MODERATION HISTORY
-- =========================================================
CREATE TABLE video_moderation_history (
    moderation_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    video_id BIGINT NOT NULL,
    moderator_id BIGINT NOT NULL,

    old_status ENUM('PENDING', 'APPROVED', 'REJECTED'),
    new_status ENUM('PENDING', 'APPROVED', 'REJECTED'),

    reason VARCHAR(500),

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_video_moderation_video
        FOREIGN KEY (video_id)
        REFERENCES videos(video_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_video_moderation_moderator
        FOREIGN KEY (moderator_id)
        REFERENCES users(user_id)
);
INSERT INTO japanese_learning.video_categories
    (category_name, description)
VALUES
    ('Japanese Culture', 'Videos about Japanese culture, traditions, customs, and lifestyle'),
    ('Japan Travel', 'Videos about travel destinations, sightseeing, and interesting places in Japan'),
    ('Japanese Food', 'Videos about Japanese cuisine, cooking, restaurants, and food culture'),
    ('Anime & Manga', 'Videos about Japanese anime, manga, characters, and related entertainment'),
    ('Japanese Music', 'Videos about Japanese music, singers, bsands, and musical performances'),
    ('Japanese Daily Life', 'Videos about daily life, school, work, and experiences in Japan'),
    ('Japanese Comedy', 'Funny, humorous, and entertaining videos related to Japan'),
    ('Japanese History', 'Videos about Japanese history, historical figures, and important events'),
    ('Japanese Language', 'Fun videos related to learning and using the Japanese language'),
    ('Japan Trends', 'Popular, interesting, and trending topics from Japan');