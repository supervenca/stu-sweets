import { useEffect, useState } from "react";
import { useCategoriesStore, type Category } from "../stores/categories.store";

import { 
  Table, 
  Input, 
  Button, 
  Space, 
  Popconfirm, 
  Typography, 
  message 
} from "antd";
import type { ColumnsType } from "antd/es/table";

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
      render: (_, record) =>
        editingId === record.id ? (
          <Space>
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
          <Space>
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
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          type="primary"
          onClick={handleCreate}
          disabled={isAddDisabled}
        >
          Add
        </Button>
      </Space>

      {/* TABLE */}
      <Table
        rowKey="id"
        dataSource={categories}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default CategoriesPage;