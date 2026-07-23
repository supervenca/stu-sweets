import { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Select,
  Popconfirm,
  Typography,
  Card,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import { useOrdersStore } from "../stores/orders.store";
import { useProductsStore } from "../stores/products.store";
import type { Order } from "../stores/orders.store";
import type { OrderItem } from "../stores/orders.store";

import { useResponsive, TABLE_CONFIG} from "../shared/responsive";


const { Title, Text } = Typography;

const OrdersPage = () => {
  const {
    orders,
    loading,
    error,
    fetchOrders,
    updateOrder,
    deleteOrder,
  } = useOrdersStore();

  const {fetchProducts} = useProductsStore();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Partial<Order>>({});
  const [pendingId, setPendingId] = useState<number | null>(null);

  const { isMobile } = useResponsive();
  const tableConfig = isMobile
  ? TABLE_CONFIG.mobile
  : TABLE_CONFIG.desktop;

  const isCake = (item: OrderItem) =>
  item.product?.category?.requiresCakeOptions;

  useEffect(() => {
    fetchOrders();
    fetchProducts();

    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);

  return () => clearInterval(interval);
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
          item.quantity > 1 ? <b>{item.quantity}</b> : item.quantity
        ),
      },
      {
        title: "Price",
        render: (_, item) => `€${item.price}`,
      },
      {
        title: "Certificate",
        render: (_, item) => item.certificate ? "Yes" : "No",
      },
    {
        title: "Size",
        render: (_, item) =>
          isCake(item)
            ? item.cakeConfig?.size ?? "—"
            : null,
      },
      {
        title: "Flavor",
        render: (_, item) =>
          isCake(item)
            ? item.cakeConfig?.flavor ?? "-"
            : null,
      },
      {
        title: "Color",
        render: (_, item) =>
          isCake(item)
            ? item.cakeConfig?.color ?? "—"
            : null,
      },
      {
        title: "Text",
        render: (_, item) =>
          isCake(item)
            ? item.cakeConfig?.message ?? "—"
            : null,
      },
      {
        title: "Text Color",
        render: (_, item) =>
          isCake(item)
            ? item.cakeConfig?.messageColor ?? "—"
            : null,
      },
    ];

    return (
      <Card size="small" style={{ background: "#fafafa", overflowX: "auto" }}>
        <Table<OrderItem>
          size="small"
          rowKey="id"
          columns={itemColumns}
          dataSource={order.items}
          pagination={false}
        />
      </Card>
    );
  };

  // MAIN TABLE
  const columns: ColumnsType<Order> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
      sorter: (a, b) => a.id - b.id
    },
    {
    title: "Created",
      dataIndex: "createdAt",
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime(),

      defaultSortOrder: "descend",

      render: (value) =>
        new Date(value).toLocaleString(),
    },
    {
      title: "Customer",
      sorter: (a, b) =>
    a.customerName.localeCompare(b.customerName),
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
      width: 300,
      render: (_, o) => renderItemsTable(o),
    },
    {
      title: "Status",
      dataIndex: "status",
      filters: [
        { text: "Pending", value: "PENDING" },
        { text: "Confirmed", value: "CONFIRMED" },
        { text: "Paid", value: "PAID" },
        { text: "Fulfilled", value: "FULFILLED" },
      ],
      //filterMultiple: false,
      onFilter: (value, record) => record.status === value,
      render: (_, o) =>
        editingId === o.id ? (
          <Select
            value={editingData.status ?? o.status}
            onChange={(v) =>
              setEditingData((p) => ({ ...p, status: v }))
            }
            style={{ width: 140 }}
          >
            {["PENDING", "CONFIRMED", "PAID", "FULFILLED"].map(
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
      title: "Pick-up Date",
      sorter: (a, b) => {
        const aDate = a.pickupSlot?.date
          ? new Date(a.pickupSlot.date).getTime()
          : 0;

        const bDate = b.pickupSlot?.date
          ? new Date(b.pickupSlot.date).getTime()
          : 0;

        return aDate - bDate;
      },
      render: (_, o) =>
        o.pickupSlot
          ? new Date(o.pickupSlot.date).toLocaleDateString()
          : "—",
    },
    {
      title: "Actions",
      render: (_, o) =>
        editingId === o.id ? (
          <Space wrap>
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
          <Space wrap>
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
      <Title level={3}>Orders <Text type="secondary">({orders.length})</Text></Title>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={orders}
        loading={loading}
        pagination={{ pageSize: 10 }}
        size={tableConfig.size}
        scroll={{ x: tableConfig.scrollX }}
      />
    </div>
  );
};

export default OrdersPage;