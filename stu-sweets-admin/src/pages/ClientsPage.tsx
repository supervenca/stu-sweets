import { useEffect, useState } from "react";
import { Table, Button, Tag, Space, Select, Input } from "antd";
import type { ColumnsType } from "antd/es/table";

import { useClientsStore, type Client } from "../stores/clients.store";

import { useResponsive, TABLE_CONFIG } from "../shared/responsive";

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

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { isMobile, isTablet } = useResponsive();

  const tableConfig = isMobile
    ? TABLE_CONFIG.mobile
    : isTablet
    ? TABLE_CONFIG.tablet
    : TABLE_CONFIG.desktop;

  const filteredClients = clients
    .filter((c) => {
      if (filter === "all") return true;
      if (filter === "active") return !c.blacklist;
      if (filter === "blacklisted") return c.blacklist;
      return true;
    })
    .filter((c) => {
      const q = debouncedSearch.toLowerCase();

      return (
        c.customerName.toLowerCase().includes(q) ||
        c.customerEmail.toLowerCase().includes(q) ||
        (c.customerPhone ?? "").toLowerCase().includes(q)
      );
  });

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(debouncedSearch);
    }, 300);

    return () => clearTimeout(t);
  }, [debouncedSearch]);

  const highlight = (text: string) => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return text;

    const parts = text.split(new RegExp(`(${q})`, "gi"));

    return parts.map((part, i) =>
      part.toLowerCase() === q ? (
        <span key={i} style={{ background: "yellow" }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const columns: ColumnsType<Client> = [
    {
      title: "Name",
      render: (_, record) => highlight(record.customerName),
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
    },
    {
      title: "Email",
      render: (_, record) => highlight(record.customerEmail),
      sorter: (a, b) => a.customerEmail.localeCompare(b.customerEmail),
    },
    {
      title: "Phone",
      render: (_, record) => highlight(record.customerPhone ?? ""),
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

      {/* SEARCH */}
      <Input
        placeholder="Search by name, email, phone"
        value={debouncedSearch}
        onChange={(e) => setDebouncedSearch(e.target.value)}
        style={{ width: 200, margin: "10px"}}
      />

      {/* TABLE */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredClients}
        loading={loading}
        scroll={{ x: tableConfig.scrollX }}
        size={tableConfig.size}
        pagination={{ pageSize: tableConfig.pageSize }}
      />
    </div>
  );
}