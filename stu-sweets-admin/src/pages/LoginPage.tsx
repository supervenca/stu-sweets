import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, Typography, message } from "antd";
import api from "../api/httpClient";
import axios from "axios";
import { useAuthStore } from "../auth/auth.store";

const { Title } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: {
    email: string;
    password: string;
  }) => {
    if (loading) return;

    setLoading(true);

    try {
      const res = await api.post("/auth/login", values);

      localStorage.setItem("token", res.data.token);

      await checkAuth();

      message.success("Welcome back 👋");

      navigate("/");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          message.error("Wrong email or password");
        } else {
          message.error("Login error. Try again later");
        }
      } else {
        message.error("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
      }}
    >
      <Card style={{ width: 360 }}>
        <Title level={3} style={{ textAlign: "center" }}>
          Admin Login
        </Title>

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Enter email" },
              { type: "email", message: "Invalid email" },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Enter password" },
              { min: 6, message: "Min 6 characters" },
            ]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
          >
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;