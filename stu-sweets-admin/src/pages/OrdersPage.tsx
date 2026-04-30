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
  Card,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import { useOrdersStore } from "../stores/orders.store";
import { useProductsStore } from "../stores/products.store";
import type { Order } from "../stores/orders.store";

const { Title, Text } = Typography;

type OrderItem = Order["items"][number];

const OrdersPage = () => {
  const {
    orders,
    loading,
    error,
    fetchOrders,
    updateOrder,
    deleteOrder,
    addItem,
    updateItem,
    deleteItem,
  } = useOrdersStore();

  const { products, fetchProducts } = useProductsStore();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Partial<Order>>({});
  const [pendingId, setPendingId] = useState<number | null>(null);

  const [newProductId, setNewProductId] = useState<number | null>(null);
  const [newQuantity, setNewQuantity] = useState(1);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, [fetchOrders, fetchProducts]);

  // ITEMS TABLE
  const renderItemsTable = (order: Order) => {
    const itemColumns: ColumnsType<OrderItem> = [
      {
        title: "Product",
        render: (_, item) => item.product?.name ?? "Unknown",
      },
      {
        title: "Qty",
        render: (_, item) => (
          <InputNumber
            min={1}
            value={item.quantity}
            onChange={(value) => {
              if (!value) return;

              updateItem(order.id, item.id, {
                quantity: Number(value),
              });

              message.success("Quantity updated");
            }}
          />
        ),
      },
      {
        title: "Price",
        render: (_, item) => `€${item.price}`,
      },
      {
        title: "",
        render: (_, item) => (
          <Popconfirm
            title="Remove item?"
            onConfirm={() => {
              deleteItem(order.id, item.id);
              message.success("Item removed");
            }}
          >
            <Button danger size="small">
              Delete
            </Button>
          </Popconfirm>
        ),
      },
    ];

    return (
      <Card size="small" style={{ background: "#fafafa" }}>
        <Table<OrderItem>
          size="small"
          rowKey="id"
          columns={itemColumns}
          dataSource={order.items}
          pagination={false}
        />

        {/* ADD ITEM */}
        <Space style={{ marginTop: 8 }}>
          <Select
            placeholder="Product"
            value={newProductId ?? undefined}
            onChange={(v) => setNewProductId(v)}
            style={{ width: 180 }}
          >
            {products.map((p) => (
              <Select.Option key={p.id} value={p.id}>
                {p.name}
              </Select.Option>
            ))}
          </Select>

          <InputNumber
            min={1}
            value={newQuantity}
            onChange={(v) => setNewQuantity(Number(v))}
          />

          <Button
            type="dashed"
            onClick={() => {
              if (!newProductId) {
                message.error("Select product");
                return;
              }

              addItem(order.id, {
                productId: newProductId,
                quantity: newQuantity,
              });

              message.success("Item added");

              setNewProductId(null);
              setNewQuantity(1);
            }}
          >
            + Add
          </Button>
        </Space>
      </Card>
    );
  };

  // =====================
  // MAIN TABLE
  // =====================
  const columns: ColumnsType<Order> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 70,
    },
    {
      title: "Customer",
      render: (_, o) =>
        editingId === o.id ? (
          <Input
            value={editingData.customerName ?? o.customerName}
            onChange={(e) =>
              setEditingData((p) => ({
                ...p,
                customerName: e.target.value,
              }))
            }
          />
        ) : (
          o.customerName
        ),
    },
    {
      title: "Email",
      render: (_, o) =>
        editingId === o.id ? (
          <Input
            value={editingData.customerEmail ?? o.customerEmail}
            onChange={(e) =>
              setEditingData((p) => ({
                ...p,
                customerEmail: e.target.value,
              }))
            }
          />
        ) : (
          o.customerEmail
        ),
    },
    {
      title: "Phone",
      render: (_, o) =>
        editingId === o.id ? (
          <Input
            value={editingData.customerPhone ?? o.customerPhone}
            onChange={(e) =>
              setEditingData((p) => ({
                ...p,
                customerPhone: e.target.value,
              }))
            }
          />
        ) : (
          o.customerPhone ?? "—"
        ),
    },
    {
      title: "Items",
      render: (_, o) => renderItemsTable(o),
    },
    {
      title: "Status",
      render: (_, o) =>
        editingId === o.id ? (
          <Select
            value={editingData.status ?? o.status}
            onChange={(v) =>
              setEditingData((p) => ({ ...p, status: v }))
            }
            style={{ width: 140 }}
          >
            {["PENDING", "CONFIRMED", "PAID", "FULFILLED", "CANCELED"].map(
              (s) => (
                <Select.Option key={s} value={s}>
                  {s}
                </Select.Option>
              )
            )}
          </Select>
        ) : (
          o.status
        ),
    },
    {
      title: "Total",
      render: (_, o) => <b>€{o.total}</b>,
    },
    {
      title: "Actions",
      render: (_, o) =>
        editingId === o.id ? (
          <Space>
            <Button
              type="primary"
              loading={pendingId === o.id}
              onClick={async () => {
                setPendingId(o.id);

                await updateOrder(o.id, editingData);

                message.success("Order updated");

                setEditingId(null);
                setPendingId(null);
              }}
            >
              Save
            </Button>

            <Button onClick={() => setEditingId(null)}>
              Cancel
            </Button>
          </Space>
        ) : (
          <Space>
            <Button
              onClick={() => {
                setEditingId(o.id);
                setEditingData({ status: o.status });
              }}
            >
              Edit
            </Button>

            <Popconfirm
              title="Delete order?"
              onConfirm={() => {
                deleteOrder(o.id);
                message.success("Order deleted");
              }}
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
      <Title level={3}>Orders ({orders.length})</Title>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={orders}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default OrdersPage;