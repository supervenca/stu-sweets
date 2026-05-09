import { useEffect, useState } from "react";
import { Row, Col, Table, Input, Button, Space, Select, Popconfirm, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";

import { useUsersStore } from "../stores/users.store";
import type { User } from "../stores/users.store";

import { TABLE_CONFIG, useResponsive } from "../shared/responsive";

const { Title, Text } = Typography;

type Role = "ADMIN" | "SUPER_ADMIN";

const UsersPage = () => {
  const {
    users,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    loading
  } = useUsersStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("ADMIN");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<Role>("ADMIN");

  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers().catch((e) => message.error(e.message));
  }, [fetchUsers]);
  
  const { isMobile, isTablet } = useResponsive();
  
    const tableConfig = isMobile
      ? TABLE_CONFIG.mobile
      : isTablet
      ? TABLE_CONFIG.tablet
      : TABLE_CONFIG.desktop;

  // validation
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidPassword = (password: string) =>
    password.length >= 6;

  // CREATE
  const handleCreate = async () => {
    if (!isValidEmail(email)) {
      message.error("Invalid email");
      return;
    }

    if (!isValidPassword(password)) {
      message.error("Password must be at least 6 characters");
      return;
    }

    try {
      await createUser({ email, password, role });

      message.success("User created");

      setEmail("");
      setPassword("");
      setRole("ADMIN");
    } catch (e) {
      const err = e as Error;
      message.error(err.message);
    }
  };

  // SAVE
  const handleSave = async (id: number) => {
    if (!isValidEmail(editEmail)) {
      message.error("Invalid email");
      return;
    }

    if (editPassword && !isValidPassword(editPassword)) {
      message.error("Password must be at least 6 characters");
      return;
    }

    setPendingId(id);

    try {
      await updateUser(id, {
        email: editEmail,
        role: editRole,
        ...(editPassword ? { password: editPassword } : {}),
      });

      message.success("User updated");
      setEditingId(null);
    } catch (e) {
      const err = e as Error;
      message.error(err.message);
    }

    setPendingId(null);
  };

  const columns: ColumnsType<User> = [
    {
      title: "ID",
      dataIndex: "id",
      
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (_, record) =>
        editingId === record.id ? (
          <Input
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
          />
        ) : (
          record.email
        ),
    },
    {
      title: "Password",
      render: (_, record) =>
        editingId === record.id ? (
          <Input.Password
            placeholder="New password"
            value={editPassword}
            onChange={(e) => setEditPassword(e.target.value)}
          />
        ) : (
          "••••••"
        ),
    },
    {
      title: "Role",
      render: (_, record) =>
        editingId === record.id ? (
          <Select
            value={editRole}
            onChange={(v) => setEditRole(v)}
            style={{ width: 150 }}
          >
            <Select.Option value="ADMIN">ADMIN</Select.Option>
            <Select.Option value="SUPER_ADMIN">
              SUPER_ADMIN
            </Select.Option>
          </Select>
        ) : (
          record.role
        ),
    },
    {
      title: "Actions",
      render: (_, record) =>
        editingId === record.id ? (
          <Space direction={isMobile ? "vertical" : "horizontal"}>
            <Button
              type="primary"
              loading={pendingId === record.id}
              onClick={() => handleSave(record.id)}
            >
              Save
            </Button>
            <Button onClick={() => setEditingId(null)}>
              Cancel
            </Button>
          </Space>
        ) : (
          <Space direction={isMobile ? "vertical" : "horizontal"}>
            <Button
              onClick={() => {
                setEditingId(record.id);
                setEditEmail(record.email);
                setEditRole(record.role);
                setEditPassword("");
              }}
            >
              Edit
            </Button>

            <Popconfirm
              title="Delete user?"
              onConfirm={async () => {
                try {
                  await deleteUser(record.id);
                  message.success("User deleted");
                } catch (e) {
                  const err = e as Error;
                  message.error(err.message);
                }
              }}
            >
              <Button danger>Delete</Button>
            </Popconfirm>
          </Space>
        ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Title level={3}>Users <Text type="secondary">({users.length})</Text></Title>

      {/* CREATE */}
      <Row gutter={[8, 8]} wrap style={{ marginBottom: 16 }}>
        <Col xs={24} sm={24} md={12} lg={5}>
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={5}>
          <Input.Password
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={5}>
          <Select
            value={role}
            onChange={(v) => setRole(v)}
            style={{ width: 150 }}
          >
            <Select.Option value="ADMIN">ADMIN</Select.Option>
            <Select.Option value="SUPER_ADMIN">
              SUPER_ADMIN
            </Select.Option>
          </Select>
        </Col>
        <Col xs={24} sm={24} md={12}>
        <Button type="primary" onClick={handleCreate}>
          Add User
        </Button>
        </Col>
      </Row>

      {/* TABLE */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={loading}
        scroll={isMobile ? { x: 800 } : undefined}
        size={tableConfig.size}
        pagination={{ pageSize: tableConfig.pageSize }}
      />
    </div>
  );
};

export default UsersPage;