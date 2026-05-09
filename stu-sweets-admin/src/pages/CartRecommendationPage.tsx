import { useEffect, useState } from "react";
import { Row, Col, Table, Select, Button, Typography, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useProductsStore } from "../stores/products.store";
import type { Product } from "../stores/products.store";
import { TABLE_CONFIG, tableCellStyle, useResponsive } from "../shared/responsive";

const { Title, Text } = Typography;

const CartRecommendationPage = () => {

    const { isMobile, isTablet } = useResponsive();
    
      const tableConfig = isMobile
        ? TABLE_CONFIG.mobile
        : isTablet
        ? TABLE_CONFIG.tablet
        : TABLE_CONFIG.desktop;
        
  const {
    products,
    fetchProducts,
    toggleRecommendation,
    loading,
  } = useProductsStore();

  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const recommended = products.filter((p) => p.isCartRecommendation);

  const availableProducts = products.filter(
    (p) => !p.isCartRecommendation
  );

  const columns: ColumnsType<Product> = [
    {
      title: "Name",
      dataIndex: "name",
      onCell: () => ({
        style: tableCellStyle,
      })
    },
    {
      title: "Price (€)",
      dataIndex: "price",
      width: 100
    },
    {
      title: "Category",
      render: (_, record) => record.category?.name,
    },
    {
      title: "Status",
      render: () => <Tag color="blue">Recommended</Tag>,
    },
    {
      title: "Action",
      render: (_, record) => (
        <Button
          danger
          onClick={() => toggleRecommendation(record.id, false)}
          loading={loading}
        >
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
        <Title level={3}>Cart Recommendations <Text type="secondary">({recommended.length})</Text></Title>

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
                toggleRecommendation(selectedId, true);
                setSelectedId(null);
                }
            }}
            >Add to Recommended
            </Button>
        </Col>
      </Row>
    {/* TABLE */}
        <Table
          rowKey="id"
          columns={columns}
          dataSource={recommended}
          loading={loading}
          scroll={isMobile ? { x: 800 } : undefined}
          size={tableConfig.size}
          pagination={{ pageSize: tableConfig.pageSize }}
        />
    </div>
  );
};

export default CartRecommendationPage;