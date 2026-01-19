const Header = () => {
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
      <button>Logout</button>
    </header>
  );
};

export default Header;
