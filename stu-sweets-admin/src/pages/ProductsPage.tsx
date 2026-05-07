import { useEffect, useState } from "react";
import { Row, Col, Table, Input, Button, Space, Select, Popconfirm, Typography, InputNumber, message } from "antd";
import type { ColumnsType } from "antd/es/table";

import { useProductsStore } from "../stores/products.store";
import { useCategoriesStore } from "../stores/categories.store";

import { useResponsive, TABLE_CONFIG } from "../shared/responsive";

const { Title, Text } = Typography;
const { TextArea } = Input;

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number | null;
  category?: {
    id: number;
    name: string;
  };
};

const ProductsPage = () => {
  const { isMobile, isTablet } = useResponsive();

  const tableConfig = isMobile
    ? TABLE_CONFIG.mobile
    : isTablet
    ? TABLE_CONFIG.tablet
    : TABLE_CONFIG.desktop;

  const {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProductsStore();

  const { categories, fetchCategories } = useCategoriesStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState({
    name: "",
    price: 0,
    description: "",
    categoryId: null as number | null,
  });

  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // CREATE
  const handleCreate = async () => {
    if (!name.trim() || !price || price <= 0) return;

    const key = "create-product";

    message.loading({ content: "Adding product...", key });

    try {
      await createProduct({
        name: name.trim(),
        price,
        categoryId,
        description: description.trim(),
      });

      message.success({ content: "Product added!", key });

      setName("");
      setDescription("");
      setPrice(null);
      setCategoryId(null);
    } catch {
      message.error({ content: "Failed to add product", key });
    }
  };

  // SAVE
  const handleSave = async (id: number) => {
    setPendingId(id);

    const key = "update-product";

    message.loading({ content: "Saving...", key });

    try {
      await updateProduct(id, {
        ...editingData,
        name: editingData.name.trim(),
        description: editingData.description.trim(),
        price: Number(editingData.price),
      });

      message.success({ content: "Updated!", key });

      setEditingId(null);
    } catch {
      message.error({ content: "Failed", key });
    }

    setPendingId(null);
  };

  // DELETE
  const handleDelete = async (id: number) => {
    const key = "delete-product";

    message.loading({ content: "Deleting...", key });

    try {
      await deleteProduct(id);
      message.success({ content: "Deleted", key });
    } catch {
      message.error({ content: "Failed", key });
    }
  };

  // TABLE
  const columns: ColumnsType<Product> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 70,
    },
    {
      title: "Name",
      render: (_, record) =>
        editingId === record.id ? (
          <Input
            value={editingData.name}
            onChange={(e) =>
              setEditingData((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
          />
        ) : (
          record.name
        ),
    },
    {
      title: "Description",
      render: (_, record) =>
        editingId === record.id ? (
          <TextArea
            value={editingData.description}
            rows={2}
            maxLength={500}
            onChange={(e) =>
              setEditingData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />
        ) : (
          record.description
        ),
    },
    {
      title: "Price (€)",
      render: (_, record) =>
        editingId === record.id ? (
          <InputNumber
            value={editingData.price}
            min={0}
            onChange={(value) =>
              setEditingData((prev) => ({
                ...prev,
                price: typeof value === "number" ? value : 0,
              }))
            }
          />
        ) : (
          record.price
        ),
    },
    {
      title: "Category",
      render: (_, record) =>
        editingId === record.id ? (
          <Select
            value={editingData.categoryId ?? undefined}
            style={{ width: 150 }}
            onChange={(value) =>
              setEditingData((prev) => ({
                ...prev,
                categoryId: value ?? null,
              }))
            }
            allowClear
          >
            {categories.map((cat) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.name}
              </Select.Option>
            ))}
          </Select>
        ) : (
          record.category?.name ?? "—"
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
            <Button onClick={() => setEditingId(null)}>Cancel</Button>
          </Space>
        ) : (
          <Space direction={isMobile ? "vertical" : "horizontal"}>
            <Button
              onClick={() => {
                setEditingId(record.id);
                setEditingData({
                  name: record.name,
                  price: record.price,
                  description: record.description,
                  categoryId: record.categoryId,
                });
              }}
            >
              Edit
            </Button>

            <Popconfirm
              title="Delete product?"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button danger loading={pendingId === record.id}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ),
    },
  ];

  if (error) return <Text type="danger">{error}</Text>;

  return (
    <div style={{ padding: 20 }}>
      <Title level={3}>
        Products <Text type="secondary">({products.length})</Text>
      </Title>

      {/* CREATE */}
      <Row gutter={[8, 8]} wrap style={{ marginBottom: 16 }}>
        <Col xs={24} sm={24} md={12} lg={5}>
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Col>

        <Col xs={24} sm={24} md={12} lg={3}>
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Price (€)"
            value={price ?? undefined}
            onChange={(v) => setPrice(v ?? null)}
          />
        </Col>

        <Col xs={24} sm={24} md={12} lg={5}>
          <TextArea
            placeholder="Description"
            value={description}
            maxLength={500}
            rows={2}
            onChange={(e) => setDescription(e.target.value)}
            showCount
            style={{ marginBottom: 20 }}
          />
        </Col>

        <Col xs={24} sm={24} md={12} lg={5}>
          <Select
            placeholder="Category"
            value={categoryId ?? undefined}
            onChange={(v) => setCategoryId(v ?? null)}
            allowClear
            style={{ width: "100%" }}
          >
            {categories.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.name}
              </Select.Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={24} md={12} lg={3}>
          <Button
            type="primary"
            block
            onClick={handleCreate}
            style={{ width: 200 }}
          >
            Add
          </Button>
        </Col>
      </Row>

      <Table
        rowKey="id"
        dataSource={products}
        columns={columns}
        loading={loading}
        scroll={{ x: tableConfig.scrollX }}
        size={tableConfig.size}
        pagination={{ pageSize: tableConfig.pageSize }}
      />
    </div>
  );
};

export default ProductsPage;