import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const AdminLayout = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1 }}>
        <Header />
        <main style={{ padding: "24px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
