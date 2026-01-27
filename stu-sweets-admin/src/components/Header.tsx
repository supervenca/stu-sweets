import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/auth.store";

const Header = () => {
  const navigate = useNavigate();
const logout = useAuthStore((s) => s.logout);

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

      <button onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
};

export default Header;
