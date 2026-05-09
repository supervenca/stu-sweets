import { useEffect, useState } from "react";
import { useSubCategoriesStore, type SubCategory } from "../stores/subCategories.store";
import { useCategoriesStore } from "../stores/categories.store";

import {
  Row,
  Col,
  Table,
  Input,
  Button,
  Space,
  Popconfirm,
  Typography,
  message,
  Select,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import {
  TABLE_CONFIG,
  tableCellStyle,
  useResponsive,
} from "../shared/responsive";

const { Title, Text } = Typography;

const SubCategoriesPage = () => {
  const {
    subCategories,
    loading,
    error,
    fetchSubCategories,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
  } = useSubCategoriesStore();

  const { categories, fetchCategories } = useCategoriesStore();

  const [name, setName] = useState("");

  const [categoryId, setCategoryId] = useState<number | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );

  const [pendingId, setPendingId] = useState<number | null>(null);

  const isAddDisabled = !name.trim() || categoryId === null;
  const isSaveDisabled =
    !editingName.trim() || editingCategoryId === null;

  const { isMobile, isTablet } = useResponsive();

  const tableConfig = isMobile
    ? TABLE_CONFIG.mobile
    : isTablet
    ? TABLE_CONFIG.tablet
    : TABLE_CONFIG.desktop;

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, [fetchSubCategories, fetchCategories]);

  // CREATE
  const handleCreate = async () => {
    if (isAddDisabled) return;

    const key = "create-subcategory";

    message.loading({ content: "Creating...", key });

    try {
      await createSubCategory(name, categoryId!);

      message.success({ content: "Sub-category created", key });

      setName("");
      setCategoryId(null);
    } catch {
      message.error({ content: "Failed to create sub-category", key });
    }
  };

  // UPDATE
  const handleSave = async (id: number) => {
    if (isSaveDisabled) return;

    setPendingId(id);

    const key = `update-subcategory-${id}`;

    message.loading({ content: "Saving...", key });

    try {
      await updateSubCategory(id, {
        name: editingName,
        categoryId: editingCategoryId!,
      });

      message.success({ content: "Sub-category updated", key });

      setEditingId(null);
      setEditingName("");
      setEditingCategoryId(null);
    } catch {
      message.error({ content: "Failed to update sub-category", key });
    } finally {
      setPendingId(null);
    }
  };

  // DELETE
  const handleDelete = async (id: number) => {
    const key = "delete-subcategory";

    message.loading({ content: "Deleting...", key });

    try {
      await deleteSubCategory(id);

      message.success({ content: "Sub-category deleted", key });
    } catch {
      message.error({ content: "Failed to delete sub-category", key });
    }
  };

  const columns: ColumnsType<SubCategory> = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      onCell: () => ({
        style: tableCellStyle,
      }),
      render: (text, record) =>
        editingId === record.id ? (
          <Input
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
          />
        ) : (
          text
        ),
    },
    {
      title: "Category",
      dataIndex: ["category", "name"],
      onCell: () => ({
        style: tableCellStyle,
      }),
      render: (text, record) =>
        editingId === record.id ? (
          <Select
            placeholder="Select category"
            value={editingCategoryId ?? undefined}
            onChange={(value) => setEditingCategoryId(value)}
            style={{ width: "100%" }}
          >
            {categories.map((cat) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.name}
              </Select.Option>
            ))}
          </Select>
        ) : (
          text || "Unassigned"
        ),
    },
    {
      title: "Actions",
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
                setEditingCategoryId(null);
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
                setEditingCategoryId(record.categoryId);
              }}
            >
              Edit
            </Button>

            <Popconfirm
              title="Delete sub-category?"
              onConfirm={() => handleDelete(record.id)}
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
        <Title level={3}>Sub-Categories <Text type="secondary">({subCategories.length})</Text></Title>
        
        {/* CREATE */}
        <Row gutter={[8, 8]} wrap={isMobile} style={{ marginBottom: 16, alignItems: "center" }}>
            <Col flex={isMobile ? "100%" : "320px"}>
                <Input
                    placeholder="Sub-category name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </Col>
            <Col flex={isMobile ? "100%" : "none"}>
                <Select
                    placeholder="Select category"
                    value={categoryId ?? undefined}
                    onChange={(value) => setCategoryId(value)}
                    style={{ width: 200 }}
                >
                    {categories.map((cat) => (
                    <Select.Option key={cat.id} value={cat.id}>
                        {cat.name}
                    </Select.Option>
                    ))}
                </Select>
            </Col>
            <Col flex={isMobile ? "100%" : "none"}>
                <Button
                    type="primary"
                    onClick={handleCreate}
                    disabled={isAddDisabled}
                >
                    Add Sub-Category
                </Button>
            </Col>
        </Row>

        {/* TABLE */}
            <Table
            rowKey="id"
            dataSource={subCategories}
            columns={columns}
            loading={loading}
            scroll={isMobile ? { x: 500 } : undefined}
            size={tableConfig.size}
            pagination={{ pageSize: tableConfig.pageSize }}
            tableLayout="auto"
            />
    </div>
  );
};

export default SubCategoriesPage;