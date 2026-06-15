import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

import {
  Calendar,
  Badge,
  Typography,
  Modal,
  Switch,
  InputNumber,
  Button,
  Space,
  message,
  Spin,
} from "antd";

import { usePickupStore, type PickupDay } from "../stores/pickup.store";

const { Title } = Typography;

type SelectedSlot = {
  date: string;
  isAvailable: boolean;
  capacity: number | null;
  booked: number;
};

const PickupCalendarPage = () => {
  const { calendar, settings, initialLoading, fetchCalendar, updateSlot, fetchSettings, updateSettings } =
    usePickupStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [defaultCapacity, setDefaultCapacity] = useState(10);
  const [minPreparationDays, setMinPreparationDays] = useState(2);
  const [settingsEditMode, setSettingsEditMode] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(dayjs());

  const normalizeDate = (d: string | dayjs.Dayjs) =>
    dayjs(d).format("YYYY-MM-DD");

  const calendarMap = useMemo(() => {
    return new Map(
      calendar.map((s) => [normalizeDate(s.date), s])
    );
  }, [calendar]);

  useEffect(() => {
    fetchCalendar();
    fetchSettings();

    const interval = setInterval(() => {
      fetchCalendar();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchCalendar, fetchSettings]);

  useEffect(() => {
  if (!settings) return;

  // eslint-disable-next-line react-hooks/set-state-in-effect
  setDefaultCapacity(
    settings.defaultDailyCakeCapacity
  );

  setMinPreparationDays(
    settings.minPreparationDays
  );
}, [settings]);

  const openDay = (date: string) => {
    const key = normalizeDate(date);
    const slot = calendarMap.get(key);

    if (!slot) {
      message.info(`No slot for ${key}`);
      return;
    }

    setSelected({
      date: slot.date,
      isAvailable: slot.status !== "UNAVAILABLE",
      capacity: slot.capacity,
      booked: slot.booked,
    });

    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!selected) return;

    try {
      await updateSlot(selected.date, {
        isAvailable: selected.isAvailable,
        maxCakeQuantity: selected.capacity,
      });

      message.success("Slot updated");

      setModalOpen(false);
      setSelected(null);

      await fetchCalendar();
    } catch {
      message.error("Failed to update slot");
    }
  };

  const handleSaveSettings = async () => {
  try {
    await updateSettings({
      defaultDailyCakeCapacity: defaultCapacity,
      minPreparationDays,
    });

    await fetchCalendar();

    message.success("Settings updated");
  } catch {
    message.error("Failed to update settings");
  }
};

  const getBadgeStatus = (slot: PickupDay) => {
    if (slot.status === "UNAVAILABLE") {
      return "default";
    }

    if (slot.status === "FULL") {
      return "error";
    }

    const percent =
      slot.capacity > 0
        ? slot.booked / slot.capacity
        : 0;

    if (percent >= 0.7) {
      return "warning";
    }

    return "success";
  };

  return (
    <div style={{ padding: 20 }}>
      <Title level={3}>Pick up Calendar</Title>

      <div
        style={{
            marginBottom: 24,
            padding: 16,
            border: "1px solid #f0f0f0",
            borderRadius: 8,
        }}
        >
        <Space direction="vertical" style={{ width: "100%" }}>
            
            {/* DISPLAY MODE */}
            {!settingsEditMode ? (
            <>
                <div>
                <b>Default Daily Cake Capacity:</b>{" "}
                {defaultCapacity}
                </div>

                <div>
                <b>Minimum Preparation Days:</b>{" "}
                {minPreparationDays}
                </div>

                <Button
                onClick={() => setSettingsEditMode(true)}
                >
                Edit global settings
                </Button>
            </>
            ) : (
            <>
                {/* EDIT MODE */}
                <div>
                <b>Default Daily Cake Capacity</b>

                <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    value={defaultCapacity}
                    onChange={(v) =>
                    setDefaultCapacity(Number(v))
                    }
                />
                </div>

                <div>
                <b>Minimum Preparation Days</b>

                <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    value={minPreparationDays}
                    onChange={(v) =>
                    setMinPreparationDays(Number(v))
                    }
                />
                </div>

                <Space>
                <Button
                    type="primary"
                    onClick={async () => {
                    await handleSaveSettings();
                    setSettingsEditMode(false);
                    }}
                >
                    Save
                </Button>

                <Button
                    onClick={() => {
                    // reset to backend values
                    if (settings) {
                        setDefaultCapacity(
                        settings.defaultDailyCakeCapacity
                        );
                        setMinPreparationDays(
                        settings.minPreparationDays
                        );
                    }

                    setSettingsEditMode(false);
                    }}
                >
                    Cancel
                </Button>
                </Space>
            </>
            )}
        </Space>
      </div>

      {initialLoading ? (
        <Spin />
      ) : (
        <Calendar
          fullscreen
          value={calendarMonth}
          onPanelChange={(value) => setCalendarMonth(value)}
          onSelect={(value) => {
            const date = value.format("YYYY-MM-DD");
            setSelectedDate(date);
          }}
          dateCellRender={(value) => {
            const date = value.format("YYYY-MM-DD");
            const slot = calendarMap.get(date);
            const isSelected = selectedDate === date;

            if (!slot) {
              return (
                <div style={{ fontSize: 11, opacity: 0.3 }}>
                  —
                </div>
              );
            }

            const badgeStatus = getBadgeStatus(slot);

            return (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDate(date);
                  openDay(date);
                }}
                style={{
                  fontSize: 12,
                  cursor: "pointer",
                  padding: 4,
                  borderRadius: 4,
                  background: isSelected ? "#e6f7ff" : undefined,
                }}
              >
                <Badge
                  status={badgeStatus}
                  text={`${slot.booked}/${slot.capacity}`}
                />

                <div style={{ fontSize: 11, opacity: 0.7 }}>
                  {slot.status === "AVAILABLE" && "Slots are available"}
                  {slot.status === "FULL" && "Booking is full"}
                  {slot.status === "UNAVAILABLE" && "Date is unavailable"}
                </div>
              </div>
            );
          }}
    />
      )}

      <Modal
        open={modalOpen}
        title="Edit pick up slot"
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        {selected && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <b>Date:</b> {selected.date}
            </div>

            <div>
              <b>Available:</b>{" "}
              <Switch
                checked={selected.isAvailable}
                onChange={(v) =>
                  setSelected((prev) =>
                    prev ? { ...prev, isAvailable: v } : prev
                  )
                }
              />
            </div>

            <div>
              <b>Capacity:</b>
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                value={selected.capacity}
                onChange={(v) =>
                  setSelected((prev) =>
                    prev ? { ...prev, capacity: Number(v) } : prev
                  )
                }
              />
            </div>

            <div>
              <b>Booked:</b> {selected.booked}
            </div>

            <Button type="primary" onClick={handleSave}>
              Save
            </Button>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default PickupCalendarPage;