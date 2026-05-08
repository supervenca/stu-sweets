import { useEffect, useState } from "react";
import { Row, Col, Table, Select, Button, Typography, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useProductsStore } from "../stores/products.store";
import type { Product } from "../stores/products.store";
import { TABLE_CONFIG, useResponsive } from "../shared/responsive";

const { Title } = Typography;

const BestsellersPage = () => {

    const { isMobile, isTablet } = useResponsive();
    
      const tableConfig = isMobile
        ? TABLE_CONFIG.mobile
        : isTablet
        ? TABLE_CONFIG.tablet
        : TABLE_CONFIG.desktop;
        
  const {
    products,
    fetchProducts,
    toggleBestseller,
    loading,
  } = useProductsStore();

  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const bestsellers = products.filter((p) => p.isBestseller);

  const availableProducts = products.filter(
    (p) => !p.isBestseller
  );

  const columns: ColumnsType<Product> = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Price (€)",
      dataIndex: "price",
    },
    {
      title: "Category",
      render: (_, record) => record.category?.name,
    },
    {
      title: "Status",
      render: () => <Tag color="gold">Bestseller</Tag>,
    },
    {
      title: "Action",
      render: (_, record) => (
        <Button
          danger
          onClick={() =>
            toggleBestseller(record.id, false)
          }
        >
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Title level={3}>Bestsellers</Title>

      {/* ADD SECTION */}
       <Row gutter={[8, 8]} wrap={isMobile} style={{ marginBottom: 16, alignItems: "center" }}>
        <Col flex={isMobile ? "100%" : "320px"}>
            <Select
            placeholder="Select product"
            style={{ width: "100%" }}
            value={selectedId}
            onChange={(value) => setSelectedId(value)}
            options={availableProducts.map((p) => ({
                value: p.id,
                label: `${p.name} - €${p.price}`,
            }))}
            />
        </Col>
        <Col flex={isMobile ? "100%" : "none"}>
            <Button
            type="primary"
            block={isMobile}
            disabled={!selectedId}
            onClick={() => {
                if (selectedId) {
                toggleBestseller(selectedId, true);
                setSelectedId(null);
                }
            }}
            >
            Add to Bestsellers
            </Button>
        </Col>
      </Row>

      {/* TABLE */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={bestsellers}
        loading={loading}
        scroll={{ x: tableConfig.scrollX }}
        size={tableConfig.size}
        pagination={{ pageSize: tableConfig.pageSize }}
      />
    </div>
  );
}

export default BestsellersPage;