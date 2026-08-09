import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCurrentUser, useLogout } from "../../hooks/useAuth";
import "./HomePage.css";

export function HomePage() {
  const navigate = useNavigate();
  const [selectedJlpt, setSelectedJlpt] = useState<string>("N4");
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const user = useAuthStore((s) => s.user);
  useCurrentUser();
  const { mutate: logout } = useLogout();

  // Retrieve user info from store / local storage
  const token = localStorage.getItem("accessToken");
  const displayName = user?.username ?? "";
  const userName = token
    ? displayName
      ? `こんにちは, ${displayName}`
      : "こんにちは"
    : "Khách";
  const avatarInitial = displayName ? displayName.charAt(0).toUpperCase() : "N";

  const handleLogout = () => {
    logout();
  };

  const playAudioSample = () => {
    setIsPlayingAudio(true);
    const utterance = new SpeechSynthesisUtterance("春になると桜が咲きます");
    utterance.lang = "ja-JP";
    utterance.onend = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="home-container">
      {/* Header Navbar */}
      <header className="home-header">
        <nav className="home-nav">
          <button
            type="button"
            className="brand-logo"
            onClick={() => navigate("/home")}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              textAlign: "left",
            }}
          >
            <div className="brand-icon">🌸</div>
            <div className="brand-text">
              <span className="brand-title">Nihongo Master</span>
              <span className="brand-subtitle">日本語を学ぼう</span>
            </div>
          </button>

          <ul className="nav-links">
            <li>
              <button type="button" className="nav-item-btn active">
                <span>🏠</span> Trang chủ
              </button>
            </li>
            <li>
              <button type="button" className="nav-item-btn">
                <span>📚</span> Từ vựng
              </button>
            </li>
            <li>
              <button type="button" className="nav-item-btn">
                <span>⛩️</span> Kanji
              </button>
            </li>
            <li>
              <button type="button" className="nav-item-btn">
                <span>📝</span> Ngữ pháp
              </button>
            </li>
            <li>
              <button type="button" className="nav-item-btn">
                <span>🎴</span> Flashcards
              </button>
            </li>
            <li>
              <button type="button" className="nav-item-btn">
                <span>🎯</span> Luyện thi JLPT
              </button>
            </li>
            <li>
              <Link to="/videos" className="nav-item-btn">
                <span>🎯</span> Video
              </Link>
            </li>
          </ul>

          <div className="user-profile-menu">
            <div className="user-badge">
              <div className="user-avatar">{avatarInitial}</div>
              <div className="user-info">
                <span className="user-name">{userName}</span>
              </div>
            </div>
            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
              title="Đăng xuất"
            >
              Đăng xuất 🚪
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="home-main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-glow"></div>
          <div>
            <div className="hero-greeting-chip">
              <span>👋</span> おかえりなさい (Welcome Back!)
            </div>
            <h1 className="hero-title">
              Chinh phục tiếng Nhật <span>JLPT {selectedJlpt}</span> dễ dàng hơn
              bao giờ hết
            </h1>
            <p className="hero-desc">
              Hệ thống học tập thông minh tích hợp Flashcard lặp lại ngắt quãng
              (SRS), tra cứu Hán tự Kanji & bộ đề thi thử sát thực tế.
            </p>

            <div className="jlpt-selector">
              <span className="jlpt-label">Trình độ của bạn:</span>
              {["N5", "N4", "N3", "N2", "N1"].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`jlpt-chip ${selectedJlpt === level ? "active" : ""}`}
                  onClick={() => setSelectedJlpt(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Continue Learning Widget */}
          <div className="continue-card">
            <div className="continue-tag">
              <span>⚡</span> Bài học đang dở
            </div>
            <h3 className="continue-title">Minna no Nihongo - Bài 12</h3>
            <p className="continue-subtitle">
              Cấu trúc Ngữ pháp: ~てから & ~てはいけません
            </p>
            <div className="progress-container">
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: "68%" }}
                ></div>
              </div>
              <div className="progress-info">
                <span>Tiến độ bài học</span>
                <span>68% (14/20 thẻ)</span>
              </div>
            </div>
            <button type="button" className="btn-primary">
              Tiếp tục học ngay <span>→</span>
            </button>
          </div>
        </section>

        {/* Learning Statistics Row */}
        <section className="stats-grid">
          <div className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{
                background: "rgba(249, 115, 22, 0.15)",
                color: "#f97316",
              }}
            >
              🔥
            </div>
            <div className="stat-info">
              <span className="stat-value">12 Ngày</span>
              <span className="stat-label">Chuỗi học (Streak)</span>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{
                background: "rgba(236, 72, 153, 0.15)",
                color: "#ec4899",
              }}
            >
              🌸
            </div>
            <div className="stat-info">
              <span className="stat-value">142 Kanji</span>
              <span className="stat-label">Đã ghi nhớ</span>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{
                background: "rgba(14, 165, 233, 0.15)",
                color: "#0ea5e9",
              }}
            >
              📚
            </div>
            <div className="stat-info">
              <span className="stat-value">480 Từ</span>
              <span className="stat-label">Từ vựng thuộc</span>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{
                background: "rgba(168, 85, 247, 0.15)",
                color: "#a855f7",
              }}
            >
              ⚡
            </div>
            <div className="stat-info">
              <span className="stat-value">2,450 XP</span>
              <span className="stat-label">Điểm kinh nghiệm</span>
            </div>
          </div>
        </section>

        {/* Features Modules */}
        <section>
          <div className="section-header">
            <h2 className="section-title">
              <span>🚀</span> Các trung tâm học tập
            </h2>
            <span className="section-link">Xem tất cả bài học →</span>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div>
                <div className="feature-top">
                  <div
                    className="feature-icon"
                    style={{ background: "rgba(14, 165, 233, 0.15)" }}
                  >
                    📚
                  </div>
                  <span className="feature-tag">1,500+ từ vựng</span>
                </div>
                <h3 className="feature-title">Kho Từ Vựng N5 - N1</h3>
                <p className="feature-desc">
                  Tra cứu từ vựng theo chủ đề, giáo trình Minna no Nihongo, kèm
                  phát âm chuẩn người bản xứ.
                </p>
              </div>
              <div className="feature-action">
                Vào học ngay <span>→</span>
              </div>
            </div>

            <div className="feature-card">
              <div>
                <div className="feature-top">
                  <div
                    className="feature-icon"
                    style={{ background: "rgba(244, 63, 94, 0.15)" }}
                  >
                    ⛩️
                  </div>
                  <span className="feature-tag">2,136 Kanji</span>
                </div>
                <h3 className="feature-title">Hán Tự Kanji Mastery</h3>
                <p className="feature-desc">
                  Hướng dẫn thứ tự nét vẽ, Âm Ôn (Onyomi), Âm Kun (Kunyomi), bộ
                  thủ và ví dụ ghép từ.
                </p>
              </div>
              <div className="feature-action">
                Khám phá Kanji <span>→</span>
              </div>
            </div>

            <div className="feature-card">
              <div>
                <div className="feature-top">
                  <div
                    className="feature-icon"
                    style={{ background: "rgba(168, 85, 247, 0.15)" }}
                  >
                    📝
                  </div>
                  <span className="feature-tag">Cấu trúc JLPT</span>
                </div>
                <h3 className="feature-title">Ngữ Pháp Tiếng Nhật</h3>
                <p className="feature-desc">
                  Tổng hợp ngữ pháp chi tiết theo cấp độ, mẫu câu ứng dụng đời
                  sống và các bẫy thường gặp.
                </p>
              </div>
              <div className="feature-action">
                Tra cứu ngữ pháp <span>→</span>
              </div>
            </div>

            <div className="feature-card">
              <div>
                <div className="feature-top">
                  <div
                    className="feature-icon"
                    style={{ background: "rgba(16, 185, 129, 0.15)" }}
                  >
                    🃏
                  </div>
                  <span className="feature-tag">Thuật toán SRS</span>
                </div>
                <h3 className="feature-title">Thẻ Ghi Nhớ Flashcards</h3>
                <p className="feature-desc">
                  Phương pháp ghi nhớ lặp lại ngắt quãng thông minh, tự động ôn
                  tập các từ bạn hay quên.
                </p>
              </div>
              <div className="feature-action">
                Luyện Flashcard <span>→</span>
              </div>
            </div>

            <div className="feature-card">
              <div>
                <div className="feature-top">
                  <div
                    className="feature-icon"
                    style={{ background: "rgba(245, 158, 11, 0.15)" }}
                  >
                    🎧
                  </div>
                  <span className="feature-tag">Audio HD</span>
                </div>
                <h3 className="feature-title">Luyện Nghe & Kaiwa</h3>
                <p className="feature-desc">
                  Bài nghe hội thoại thực tế, luyện phản xạ nghe nói tiếng Nhật
                  chuẩn tự nhiên.
                </p>
              </div>
              <div className="feature-action">
                Luyện nghe ngay <span>→</span>
              </div>
            </div>

            <div className="feature-card">
              <div>
                <div className="feature-top">
                  <div
                    className="feature-icon"
                    style={{ background: "rgba(6, 182, 212, 0.15)" }}
                  >
                    ⏱️
                  </div>
                  <span className="feature-tag">Đề mới 2026</span>
                </div>
                <h3 className="feature-title">Đề Thi Thử JLPT</h3>
                <p className="feature-desc">
                  Bộ đề thi trắc nghiệm bấm giờ thực tế N5 - N1 có đáp án chi
                  tiết và xếp hạng điểm.
                </p>
              </div>
              <div className="feature-action">
                Thử sức ngay <span>→</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Section: Word of the Day & Roadmap */}
        <section className="bottom-grid">
          {/* Word of the Day Card */}
          <div className="word-of-day-card">
            <div className="wotd-header">
              <span className="wotd-badge">🌸 Từ vựng hôm nay</span>
              <button
                type="button"
                className="nav-item-btn"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  padding: "4px 10px",
                  fontSize: "0.8rem",
                }}
                onClick={playAudioSample}
                disabled={isPlayingAudio}
              >
                {isPlayingAudio ? "🔊 Đang phát..." : "🔊 Nghe âm thanh"}
              </button>
            </div>

            <div className="wotd-main">
              <span className="wotd-kanji">桜</span>
              <span className="wotd-furigana">さくら (Sakura)</span>
            </div>

            <div className="wotd-meaning">
              ✨ <strong>Ý nghĩa:</strong> Hoa anh đào
            </div>

            <div className="wotd-example">
              <div className="wotd-jp-sentence">春になると桜が咲きます。</div>
              <div className="wotd-vi-sentence">
                Vào mùa xuân, hoa anh đào sẽ nở rộ.
              </div>
            </div>
          </div>

          {/* Learning Roadmap */}
          <div className="roadmap-card">
            <div className="section-header" style={{ marginBottom: 12 }}>
              <h2 className="section-title">
                <span>🗺️</span> Lộ trình học tập của bạn
              </h2>
              <span className="section-link">Chi tiết lộ trình</span>
            </div>

            <div className="roadmap-list">
              <div className="roadmap-item completed">
                <div className="roadmap-status-icon">✓</div>
                <div className="roadmap-details">
                  <span className="roadmap-step-title">
                    Bảng chữ cái Hiragana & Katakana
                  </span>
                  <span className="roadmap-step-desc">
                    Đã hoàn thành 100% • 92 Ký tự
                  </span>
                </div>
              </div>

              <div className="roadmap-item completed">
                <div className="roadmap-status-icon">✓</div>
                <div className="roadmap-details">
                  <span className="roadmap-step-title">Trình độ Sơ cấp N5</span>
                  <span className="roadmap-step-desc">
                    Đã hoàn thành 100% • 80 Kanji & 800 Từ vựng
                  </span>
                </div>
              </div>

              <div className="roadmap-item current">
                <div className="roadmap-status-icon">⚡</div>
                <div className="roadmap-details">
                  <span className="roadmap-step-title">
                    Trình độ Sơ cấp N4 (Đang học)
                  </span>
                  <span className="roadmap-step-desc">
                    Tiến độ 45% • 170 Kanji & 1,200 Từ vựng
                  </span>
                </div>
              </div>

              <div className="roadmap-item locked">
                <div className="roadmap-status-icon">🔒</div>
                <div className="roadmap-details">
                  <span className="roadmap-step-title">
                    Trình độ Trung cấp N3
                  </span>
                  <span className="roadmap-step-desc">Chưa mở khóa</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <p>
          © 2026 Japanese Learning Platform — Nihongo Master. Chúc bạn học tốt!
        </p>
      </footer>
    </div>
  );
}
