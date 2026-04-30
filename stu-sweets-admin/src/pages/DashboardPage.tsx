import { Row, Col, Card, Typography } from "antd";

const { Title, Text } = Typography;

const DashboardPage = () => {
  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <Title level={2}>Dashboard</Title>
      <Text type="secondary">Welcome back 👋</Text>

      {/* Cards */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} md={8}>
          <Card>
            <Title level={4}>Orders</Title>
            <Text type="secondary">Manage customer orders</Text>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Title level={4}>Products</Title>
            <Text type="secondary">Manage your catalog</Text>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Title level={4}>Users</Title>
            <Text type="secondary">Admin access control</Text>
          </Card>
        </Col>
      </Row>

      {/* Hero block */}
      <Card
        style={{ marginTop: 24 }}
        bodyStyle={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <div>
          <Title level={3}>🍰 STU Sweets Admin</Title>
          <Text>
            Manage orders, products, categories and users in one place.
          </Text>
        </div>

        <img
          src="https://images.unsplash.com/photo-1559620192-032c4bc4674e"
          alt="cupcake"
          style={{
            width: 160,
            borderRadius: 12,
            objectFit: "cover",
          }}
        />
      </Card>
    </div>
  );
};

export default DashboardPage;