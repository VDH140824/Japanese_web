import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { getCurrentUser } from "../../api/authApi";

export function OAuth2RedirectPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (token) {
      // Temporarily store the token so the Axios interceptor can attach it
      localStorage.setItem("accessToken", token);

      // Fetch the real user profile and populate the store
      getCurrentUser()
        .then((user) => {
          setAuth(user, token);
          navigate("/home", { replace: true });
        })
        .catch(() => {
          // If /users/me fails, still navigate to home with the token
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
      <p style={{ fontSize: 16, color: "#94a3b8" }}>Processing Google login, please wait...</p>
    </div>
  );
}
