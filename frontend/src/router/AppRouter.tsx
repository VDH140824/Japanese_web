import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";
import { VerifyEmailPage } from "../pages/auth/VerifyEmailPage";
import { OAuth2RedirectPage } from "../pages/auth/OAuth2RedirectPage";
import { HomePage } from "../pages/home/HomePage";
import { BackgroundMusic } from "../components/ui/BackgroundMusic";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { VideoEntertainmentPage } from "../pages/video/VideoEntertainmentPage";
import { VideoModerationPage } from "../pages/video/VideoModerationPage";
import { VideoUploadPage } from "../pages/video/VideoUploadPage";

export function AppRouter() {
  return (
    <>
      <BackgroundMusic />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route path="/videos" element={<VideoEntertainmentPage />} />
        <Route
          path="/videos/upload"
          element={
            <ProtectedRoute>
              <VideoUploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/videos"
          element={
            <ProtectedRoute>
              <VideoModerationPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  );
}
