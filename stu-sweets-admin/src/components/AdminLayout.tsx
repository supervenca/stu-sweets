import { Layout, Menu, Typography, Button, Space } from "antd";
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  TagsOutlined,
  UserOutlined,
  TeamOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../auth/auth.store";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuthStore();

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/orders",
      icon: <ShoppingCartOutlined />,
      label: "Orders",
    },
    {
      key: "/products",
      icon: <AppstoreOutlined />,
      label: "Products",
    },
    {
      key: "/categories",
      icon: <TagsOutlined />,
      label: "Categories",
    },
    {
      key: "/clients",
      icon: <TeamOutlined />,
      label: "Clients",
    },
    user?.role === "SUPER_ADMIN"
      ? {
          key: "/users",
          icon: <UserOutlined />,
          label: "Users",
        }
      : null,
  ].filter(Boolean);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider breakpoint="lg" collapsedWidth="80">
        <div
          style={{
            color: "#fff",
            padding: 16,
            fontWeight: 600,
            fontSize: 18,
          }}
        >
          🍰 STU Sweets
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      {/* Main */}
      <Layout>
        {/* Header */}
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Admin Panel
          </Title>

          <Space>
            <Text>{user?.email}</Text>

            <Button
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Space>
        </Header>

        {/* Content */}
        <Content style={{ margin: 24 }}>
          <div
            style={{
              padding: 24,
              background: "#fff",
              borderRadius: 12,
              minHeight: 360,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;