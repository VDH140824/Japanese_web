import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function OAuth2RedirectPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (token) {
      localStorage.setItem("accessToken", token);
      // Redirect to home/dashboard after successful Google login
      navigate("/home", { replace: true });
    } else if (error) {
      alert("Google Sign-In failed: " + error);
      navigate("/login", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#fff" }}>
      <p>Processing Google login, please wait...</p>
    </div>
  );
}
