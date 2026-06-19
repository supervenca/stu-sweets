import { useEffect } from "react";
import {
  Typography,
  Upload,
  Button,
  Card,
  Space,
  Switch,
  Popconfirm,
  message,
  Image,
  Spin,
} from "antd";

import {
  UploadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { useCarouselStore } from "../stores/carousel.store";
import { getImageUrl } from "../shared/utils/getImageUrl";

const { Title, Text } = Typography;

const CarouselPage = () => {
  const {
    slides,
    loading,
    error,
    fetchSlides,
    uploadSlide,
    deleteSlide,
    toggleActive,
    moveUp,
    moveDown,
  } = useCarouselStore();

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const handleUpload = async (file: File) => {
    const key = "upload-slide";

    message.loading({
      content: "Uploading image...",
      key,
    });

    try {
      await uploadSlide(file);

      message.success({
        content: "Slide uploaded",
        key,
      });
    } catch {
      message.error({
        content: "Upload failed",
        key,
      });
    }

    return false;
  };

  const handleDelete = async (id: number) => {
    const key = "delete-slide";

    message.loading({
      content: "Deleting slide...",
      key,
    });

    try {
      await deleteSlide(id);

      message.success({
        content: "Slide deleted",
        key,
      });
    } catch {
      message.error({
        content: "Delete failed",
        key,
      });
    }
  };

  if (error) {
    return (
      <Text type="danger">
        {error}
      </Text>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <Title level={3}>
        Homepage Carousel
      </Title>

      <div style={{ marginBottom: 24 }}>
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={(file) => {
            handleUpload(file);
            return false;
          }}
        >
          <Button icon={<UploadOutlined />}>
            Upload slide
          </Button>
        </Upload>
      </div>

      {loading ? (
        <Spin />
      ) : (
        <Space
          direction="vertical"
          size="large"
          style={{ width: "100%" }}
        >
          {slides.map((slide) => (
            <Card
              key={slide.sortOrder}
              title={`Slide #${slide.sortOrder}`}
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
              >
                <Image
                  src={getImageUrl(slide.imageUrl)}
                  alt={`Slide ${slide.sortOrder}`}
                  width={300}
                />

                <div>
                  <Text strong>
                    Active:
                  </Text>{" "}
                  <Switch
                    checked={slide.isActive}
                    onChange={(value) =>
                      toggleActive(
                        slide.id,
                        value
                      )
                    }
                  />
                </div>

                <Space wrap>
                  <Button
                    icon={<ArrowUpOutlined />}
                    onClick={() =>
                      moveUp(slide.id)
                    }
                  >
                    Move Up
                  </Button>

                  <Button
                    icon={<ArrowDownOutlined />}
                    onClick={() =>
                      moveDown(slide.id)
                    }
                  >
                    Move Down
                  </Button>

                  <Popconfirm
                    title="Delete slide?"
                    description="This action cannot be undone."
                    onConfirm={() =>
                      handleDelete(slide.id)
                    }
                  >
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                    >
                      Delete
                    </Button>
                  </Popconfirm>
                </Space>
              </Space>
            </Card>
          ))}
        </Space>
      )}
    </div>
  );
};

export default CarouselPage;