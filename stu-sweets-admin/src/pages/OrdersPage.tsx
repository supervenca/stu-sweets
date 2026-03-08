import { useEffect, useState } from "react";
import { useOrdersStore } from "../stores/orders.store";
import type { Order } from "../stores/orders.store";

const OrdersPage = () => {
  const {
    orders,
    loading,
    error,
    fetchOrders,
    updateOrder,
    deleteOrder,
  } = useOrdersStore();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Partial<Order>>({});
  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>
        Orders <span style={{ color: "#6b7280" }}>({orders.length})</span>
      </h1>

      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        <table style={tableStyles.table}>
          <thead>
            <tr>
              <th style={tableStyles.th}>ID</th>
              <th style={tableStyles.th}>Customer</th>
              <th style={tableStyles.th}>Email</th>
              <th style={tableStyles.th}>Phone</th>
              <th style={tableStyles.th}>Items</th>
              <th style={tableStyles.th}>Status</th>
              <th style={tableStyles.th}>Total</th>
              <th style={tableStyles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const isEditing = editingId === o.id;
              return (
                <tr key={o.id}>
                  <td style={tableStyles.td}>{o.id}</td>
                  <td style={tableStyles.td}>{o.customerName}</td>
                  <td style={tableStyles.td}>{o.customerEmail}</td>
                  <td style={tableStyles.td}>{o.customerPhone ?? "—"}</td>
                  <td style={tableStyles.td}>
                    {o.items.map(i => (
                      <div key={i.id}>
                        {i.product?.name ?? "Unknown"} × {i.quantity} (${i.price})
                      </div>
                    ))}
                  </td>
                  <td style={tableStyles.td}>
                    {isEditing ? (
                      <select
                        value={editingData.status ?? o.status}
                        onChange={(e) =>
                          setEditingData((prev) => ({
                            ...prev,
                            status: e.target.value as Order["status"],
                          }))
                        }
                      >
                        {["PENDING","CONFIRMED","PAID","FULFILLED","CANCELED"].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      o.status
                    )}
                  </td>
                  <td style={tableStyles.td}>{o.total}</td>
                  <td style={tableStyles.td}>
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => {
                            if (!editingData.status) return;
                            setPendingId(o.id);
                            updateOrder(o.id, { status: editingData.status })
                              .then(() => setEditingId(null))
                              .finally(() => setPendingId(null));
                          }}
                          disabled={pendingId === o.id}
                        >
                          {pendingId === o.id ? "Saving..." : "Save"}
                        </button>{" "}
                        <button onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(o.id);
                            setEditingData({ status: o.status });
                          }}
                        >
                          Edit
                        </button>{" "}
                        <button
                          onClick={() => deleteOrder(o.id)}
                          disabled={pendingId === o.id}
                        >
                          {pendingId === o.id ? "Deleting..." : "Delete"}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrdersPage;

const tableStyles: Record<string, React.CSSProperties> = {
  table: { width: "100%", borderCollapse: "collapse", background: "#fff" },
  th: { textAlign: "left", padding: "12px", borderBottom: "2px solid #e5e7eb" },
  td: { padding: "12px", borderBottom: "1px solid #e5e7eb" },
};