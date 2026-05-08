import { useEffect, useState } from "react";
import { useCategoriesStore, type Category } from "../stores/categories.store";

import { Row, Col, Table, Input, Button, Space, Popconfirm, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";

import { TABLE_CONFIG, useResponsive } from "../shared/responsive";

const { Title, Text } = Typography;

const CategoriesPage = () => {
  const {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategoriesStore();

  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);

  const isAddDisabled = !name.trim();
  const isSaveDisabled = !editingName.trim();

  const { isMobile, isTablet } = useResponsive();

  const tableConfig = isMobile
    ? TABLE_CONFIG.mobile
    : isTablet
    ? TABLE_CONFIG.tablet
    : TABLE_CONFIG.desktop;

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;

    const key = "create-category";

    message.loading({ content: "Creating...", key });

    try {
      await createCategory(name);
      message.success({ content: "Category created", key });
      setName("");
    } catch {
      message.error({ content: "Failed to create category", key });
    }
  };

  const handleSave = async (id: number) => {
    if (!editingName.trim()) return;

    setPendingId(id);

    const key = "update-category";

    message.loading({ content: "Saving...", key });

    try {
      await updateCategory(id, editingName);
      message.success({ content: "Category updated", key });

      setEditingId(null);
    } catch {
      message.error({ content: "Failed to update category", key });
    }

    setPendingId(null);
  };

  const handleDelete = async (id: number) => {
    const key = "delete-category";

    message.loading({ content: "Deleting...", key });

    try {
      await deleteCategory(id);
      message.success({ content: "Category deleted", key });
    } catch {
      message.error({ content: "Failed to delete category", key });
    }
  };

  const columns: ColumnsType<Category> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
    },
    {
      title: "Name",
      width: isMobile ? 100 : 300,
      render: (_, record) =>
        editingId === record.id ? (
          <Input
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            autoFocus
          />
        ) : (
          record.name
        ),
    },
    {
      title: "Actions",
      width: isMobile ? 120 : 220,
      render: (_, record) =>
        editingId === record.id ? (
          <Space direction={isMobile ? "vertical" : "horizontal"}>
            <Button
              type="primary"
              onClick={() => handleSave(record.id)}
              loading={pendingId === record.id}
              disabled={isSaveDisabled}
            >
              Save
            </Button>
            <Button
              onClick={() => {
                setEditingId(null);
                setEditingName("");
              }}
            >
              Cancel
            </Button>
          </Space>
        ) : (
          <Space direction={isMobile ? "vertical" : "horizontal"}>
            <Button
              onClick={() => {
                setEditingId(record.id);
                setEditingName(record.name);
              }}
            >
              Edit
            </Button>

            <Popconfirm
              title="Delete category?"
              description="This action cannot be undone"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger>Delete</Button>
            </Popconfirm>
          </Space>
        ),
    },
  ];

  if (error) return <Text type="danger">{error}</Text>;

  return (
    <div style={{ padding: 20 }}>
      <Title level={3}>
        Categories <Text type="secondary">({categories.length})</Text>
      </Title>

      {/* CREATE */}
      <Row gutter={[8, 8]} wrap={isMobile} style={{ marginBottom: 16, alignItems: "center" }}>
        <Col flex={isMobile ? "100%" : "320px"}>
          <Input
            placeholder="Category name"
            style={{ width: "100%" }}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Col>
        <Col flex={isMobile ? "100%" : "none"}>
          <Button
            type="primary"
            block={isMobile}
            onClick={handleCreate}
            disabled={isAddDisabled}
          >
            Add
          </Button>
        </Col>
      </Row>

      {/* TABLE */}
      <Table
        rowKey="id"
        dataSource={categories}
        columns={columns}
        loading={loading}
        scroll={{ x: isMobile ? 500 : 700 }}
        size={tableConfig.size}
        pagination={{ pageSize: tableConfig.pageSize }}
        tableLayout="auto"
      />
    </div>
  );
};

export default CategoriesPage;