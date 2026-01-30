import { useState } from "react";
import { useNavigate } from "react-router-dom";
import httpClient from "../api/httpClient";
import axios from "axios";
import { useAuthStore } from "../auth/auth.store";


const LoginPage = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

try {
      // Сохраняем ответ сервера
      const res = await httpClient.post("/auth/login", { email, password });

      // Сохраняем JWT в localStorage
      localStorage.setItem("token", res.data.token);
      // Обновляем store, чтобы ProtectedRoute сразу видел user
      await checkAuth();
      // Переходим на dashboard
      navigate("/");
    } catch (err: unknown) {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 401) {
      setError("Wrong email or password");
    } else {
      setError("Login error. Please try again later");
    }
  } else {
    setError("Unknown error");
  }
} finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1>Admin Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f5f5",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 24,
    width: 320,
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
  error: {
    color: "red",
    fontSize: 14,
  },
};
