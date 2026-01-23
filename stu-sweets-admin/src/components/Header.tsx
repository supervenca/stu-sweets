import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. удаляем токен
    localStorage.removeItem("token");

    // 2. редирект на логин (без возможности вернуться назад)
    navigate("/login", { replace: true });
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
