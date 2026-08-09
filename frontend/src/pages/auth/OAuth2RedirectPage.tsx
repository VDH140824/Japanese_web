import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { getCurrentUser } from "../../api/authApi";
import type { UserResponse } from "../../types/auth";

export function OAuth2RedirectPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    const token = searchParams.get("token");
    const username = searchParams.get("username");
    const email = searchParams.get("email");
    const error = searchParams.get("error");

    if (token) {
      // Temporarily store the token so the Axios interceptor can attach it
      localStorage.setItem("accessToken", token);

      const fallbackUser: UserResponse | null =
        username && email
          ? {
              id: 0,
              username,
              email,
              role: "USER",
              emailVerified: true,
            }
          : null;

      // Set a useful immediate user snapshot so the UI doesn't briefly show "Khách"
      // while the real profile request is still resolving.
      if (fallbackUser) {
        setAuth(fallbackUser, token);
      } else {
        useAuthStore.setState({
          accessToken: token,
          isAuthenticated: true,
        });
      }

      // Fetch the real user profile and replace the temporary snapshot with the
      // canonical backend user record.
      getCurrentUser()
        .then((user) => {
          setAuth(user, token);
          navigate("/home", { replace: true });
        })
        .catch((err) => {
          console.error("Failed to load Google user profile", err);

          if (fallbackUser) {
            setAuth(fallbackUser, token);
          }

          navigate("/home", { replace: true });
        });
    } else if (error) {
      clearAuth();
      alert("Google Sign-In failed: " + error);
      navigate("/login", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate, setAuth, clearAuth]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        color: "#fff",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ fontSize: 40 }}>🔄</div>
      <p style={{ fontSize: 16, color: "#94a3b8" }}>
        Processing Google login, please wait...
      </p>
    </div>
  );
}
