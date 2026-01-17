import { useState } from "react";
import { useNavigate } from "react-router-dom";
import httpClient from "../api/httpClient";
import axios from "axios";


const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
  await httpClient.post("/auth/login", { email, password });
  navigate("/");
} catch (err: unknown) {
  if (axios.isAxiosError(err)) {
    setError(err.response?.data?.message || "Ошибка входа");
  } else {
    setError("Неизвестная ошибка");
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
