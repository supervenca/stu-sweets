import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside
      style={{
        width: "220px",
        background: "#1e1e2f",
        color: "#fff",
        padding: "20px",
      }}
    >
      <h2 style={{ marginBottom: "24px" }}>STU Admin</h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <NavLink to="/" style={linkStyle}>Dashboard</NavLink>
        <NavLink to="/users" style={linkStyle}>Users</NavLink>
        <NavLink to="/orders" style={linkStyle}>Orders</NavLink>
        <NavLink to="/products" style={linkStyle}>Products</NavLink>
        <NavLink to="/categories" style={linkStyle}>Categories</NavLink>
      </nav>
    </aside>
  );
};

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  color: isActive ? "#4ade80" : "#fff",
  textDecoration: "none",
  fontWeight: isActive ? "bold" : "normal",
});

export default Sidebar;
