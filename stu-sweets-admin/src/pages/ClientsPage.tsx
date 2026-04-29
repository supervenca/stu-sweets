import { useEffect } from "react";
import { Table, Button, Tag, Space, Select } from "antd";
import type { ColumnsType } from "antd/es/table";

import { useClientsStore, type Client } from "../stores/clients.store";

const { Option } = Select;

export default function ClientsPage() {
  const {
    clients,
    fetchClients,
    toggleBlacklist,
    loading,
    filter,
    setFilter,
  } = useClientsStore();

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter((c) => {
    if (filter === "all") return true;
    if (filter === "active") return !c.blacklist;
    if (filter === "blacklisted") return c.blacklist;
    return true;
  });

  const columns: ColumnsType<Client> = [
    {
      title: "Name",
      dataIndex: "customerName",
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
    },
    {
      title: "Email",
      dataIndex: "customerEmail",
      sorter: (a, b) => a.customerEmail.localeCompare(b.customerEmail),
    },
    {
      title: "Phone",
      dataIndex: "customerPhone",
    },
    {
      title: "Orders",
      render: (_, record) => record._count?.orders ?? 0,
      sorter: (a, b) =>
        (a._count?.orders ?? 0) - (b._count?.orders ?? 0),
    },
    {
      title: "Status",
      render: (_, record) =>
        record.blacklist ? (
          <Tag color="red">Blacklisted</Tag>
        ) : (
          <Tag color="green">Active</Tag>
        ),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Button
          danger={!record.blacklist}
          onClick={() =>
            toggleBlacklist(record.id, !record.blacklist)
          }
        >
          {record.blacklist ? "Unblock" : "Block"}
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Clients</h2>

      {/* FILTER */}
      <Space style={{ marginBottom: 16 }}>
        <span>Filter:</span>
        <Select
          value={filter}
          onChange={(value) => setFilter(value)}
          style={{ width: 200 }}
        >
          <Option value="all">All</Option>
          <Option value="active">Active</Option>
          <Option value="blacklisted">Blacklisted</Option>
        </Select>
      </Space>

      {/* TABLE */}
      <Table
        pagination={{ pageSize: 10 }}
        rowKey="id"
        columns={columns}
        dataSource={filteredClients}
        loading={loading}
      />
    </div>
  );
}