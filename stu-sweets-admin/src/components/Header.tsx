import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/auth.store";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header
      style={{
        height: "60px",
        background: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        borderBottom: "1px solid #ddd",
      }}
    >
      <span>Admin panel</span>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {user && (
          <span style={{ fontWeight: "bold", color: "#333" }}>
            {user.email} {/* Можно заменить на user.name, если есть */}
          </span>
        )}
        <button
          onClick={handleLogout}
          style={{
            padding: "6px 12px",
            background: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;