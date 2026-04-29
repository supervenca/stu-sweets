import { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Select,
  Popconfirm,
  Typography,
  InputNumber,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import { useProductsStore } from "../stores/products.store";
import { useCategoriesStore } from "../stores/categories.store";
import toast from "react-hot-toast";

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

    await toast.promise(
      createProduct({
        name: name.trim(),
        price,
        categoryId,
        description: description.trim(),
      }),
      {
        loading: "Adding product...",
        success: "Product added!",
        error: "Failed to add product",
      }
    );

    setName("");
    setDescription("");
    setPrice(null);
    setCategoryId(null);
  };

  // SAVE
  const handleSave = async (id: number) => {
    setPendingId(id);

    await toast.promise(
      updateProduct(id, {
        ...editingData,
        name: editingData.name.trim(),
        description: editingData.description.trim(),
        price: Number(editingData.price)
      }),
      {
        loading: "Saving...",
        success: "Updated!",
        error: "Failed",
      }
    );

    setEditingId(null);
    setPendingId(null);
  };

  // DELETE
  const handleDelete = async (id: number) => {
    await toast.promise(deleteProduct(id), {
      loading: "Deleting...",
      success: "Deleted",
      error: "Failed",
    });
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
          <Space>
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
          <Space>
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
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <InputNumber
          placeholder="Price (€)"
          value={price ?? undefined}
          onChange={(v) => setPrice(v ?? null)}
        />

        <Input.TextArea
          placeholder="Description"
          value={description}
          maxLength={500}
          rows={2}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: 250 }}
          showCount
        />

        <Select
          placeholder="Category"
          value={categoryId ?? undefined}
          onChange={(v) => setCategoryId(v ?? null)}
          allowClear
          style={{ width: 180 }}
        >
          {categories.map((c) => (
            <Select.Option key={c.id} value={c.id}>
              {c.name}
            </Select.Option>
          ))}
        </Select>

        <Button type="primary" onClick={handleCreate}>
          Add
        </Button>
      </Space>

      <Table
        rowKey="id"
        dataSource={products}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default ProductsPage;