import { useEffect, useState } from "react";
import { useOrdersStore } from "../stores/orders.store";
import { useProductsStore } from "../stores/products.store";
import type { Order } from "../stores/orders.store";
import { downloadInvoice, generateInvoice } from "../stores/invoices.store";
import toast from "react-hot-toast";

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
  const [validationErrors, setValidationErrors] = useState<{
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
  }>({});
  const [newProductId, setNewProductId] = useState<number | null>(null);
  const [newQuantity, setNewQuantity] = useState(1);
  

  const validateOrderData = (data: Partial<Order>) => {
  const errors: typeof validationErrors = {};
  if (data.customerName !== undefined && data.customerName.trim() === "") {
    errors.customerName = "Name cannot be empty";
  }
  if (data.customerEmail !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.customerEmail)) {
      errors.customerEmail = "Invalid email format";
    }
  }
  if (data.customerPhone !== undefined) {
    const digits = data.customerPhone.replace(/\D/g, "");
    if (digits.length < 10) {
      errors.customerPhone = "Phone must have at least 10 digits";
    }
  }
  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, [fetchOrders, fetchProducts]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
    <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      Orders
      <span style={{ color: "#6b7280" }}>({orders.length})</span>

      {loading && (
        <span style={{ fontSize: "14px", color: "#6b7280" }}>
          ⟳ updating...
        </span>
      )}
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
              <th style={tableStyles.th}>Invoice</th>
            </tr>
          </thead>

          <tbody>
            {orders
              .slice()
              .sort((a, b) => a.id - b.id)
              .map((o) => {
                const isEditing = editingId === o.id;
              return (
                <tr key={o.id}>
                  <td style={tableStyles.td}>{o.id}</td>
                  {/* CUSTOMER NAME */}
                  <td style={tableStyles.td}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingData.customerName ?? o.customerName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingData((prev) => ({ ...prev, customerName: val }));
                          validateOrderData({ ...editingData, customerName: val });
                        }}
                        style={{
                          borderColor: validationErrors.customerName ? "red" : undefined,
                        }}
                      />
                    ) : (
                      o.customerName
                    )}
                  </td>
                  {/* CUSTOMER EMAIL */}
                  <td style={tableStyles.td}>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editingData.customerEmail ?? o.customerEmail}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingData((prev) => ({ ...prev, customerEmail: val }));
                          validateOrderData({ ...editingData, customerEmail: val });
                        }}
                        style={{
                          borderColor: validationErrors.customerEmail ? "red" : undefined,
                        }}
                      />
                    ) : (
                      o.customerEmail
                    )}
                  </td>
                  {/* CUSTOMER PHONE */}
                  <td style={tableStyles.td}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingData.customerPhone ?? o.customerPhone ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingData((prev) => ({ ...prev, customerPhone: val }));
                          validateOrderData({ ...editingData, customerPhone: val });
                        }}
                        style={{
                          borderColor: validationErrors.customerPhone ? "red" : undefined,
                        }}
                      />
                    ) : (
                      o.customerPhone ?? "—"
                    )}
                  </td>
                  {/* ITEMS */}
                  <td style={tableStyles.td}>
                    {o.items
                      .slice()
                      .sort((a, b) => a.id - b.id)
                      .map((i) => (
                        <div key={i.id} style={tableStyles.itemRow}>
                          {i.product?.name ?? "Unknown"}
                      {/* EDIT ITEM QUANTITY */}
                        <input
                          type="number"
                          min={1}
                          value={i.quantity}
                          style={tableStyles.qtyInput}
                          onChange={(e) => {
                            const newQty = Number(e.target.value);

                            const confirmed = window.confirm(
                              `Change quantity to ${newQty}?`
                            );

                            if (!confirmed) return;

                            updateItem(o.id, i.id, {
                              quantity: newQty,
                            });
                          }}
                        />
                        <span>€{i.price}</span>
                        {/* DELETE ITEM */}
                        <button
                            style={tableStyles.deleteItemBtn}
                            onClick={() => {
                              const confirmed = window.confirm(
                                `Remove ${i.product?.name} from order?`
                              );

                              if (!confirmed) return;

                              deleteItem(o.id, i.id);
                            }}
                          >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* ADD ITEM */}
                    <div style={tableStyles.addRow}>
                      <select
                        value={newProductId ?? ""}
                        onChange={(e) =>
                          setNewProductId(Number(e.target.value))
                        }
                      >
                        <option value="">Product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min={1}
                        value={newQuantity}
                        onChange={(e) =>
                          setNewQuantity(Number(e.target.value))
                        }
                        style={tableStyles.qtyInput}
                      />

                      <button
                        onClick={() => {
                          if (!newProductId) return;

                          addItem(o.id, {
                            productId: newProductId,
                            quantity: newQuantity,
                          });

                          setNewProductId(null);
                          setNewQuantity(1);
                        }}
                      >
                        + Add
                      </button>
                    </div>
                  </td>

                  {/* STATUS */}
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
                        {[
                          "PENDING",
                          "CONFIRMED",
                          "PAID",
                          "FULFILLED",
                          "CANCELED",
                        ].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    ) : (
                      o.status
                    )}
                  </td>
                  {/* TOTAL */}
                  <td style={tableStyles.td}>€{o.total}</td>

                  {/* ACTIONS */}
                  <td style={tableStyles.td}>
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => {
                            const isValid = validateOrderData(editingData);
                            if (!isValid) {
                              const firstError = Object.values(validationErrors)[0];
                              if (firstError) toast.error(firstError);
                              return;
                            }
                            const confirmed = window.confirm("Save changes to this order?");
                            if (!confirmed) return;
                            setPendingId(o.id);
                            updateOrder(o.id, editingData)
                              .then(() => setEditingId(null))
                              .finally(() => setPendingId(null));
                          }}
                        >
                          {pendingId === o.id ? "Saving..." : "Save"}
                        </button>

                        <button onClick={() => setEditingId(null)}>
                          Cancel
                        </button>
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
                        </button>

                        <button onClick={() => deleteOrder(o.id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                  
                  {/* INVOICE */}
                  <td style={tableStyles.td}>
                    <button
                      onClick={() => generateInvoice(o.id)}
                      disabled={o.invoiceExists} // можно дизейблить, если уже сгенерирован
                    >{o.invoiceExists ? "Invoice Generated" : "Generate"}
                    </button>

                    <button
                      onClick={() => downloadInvoice(o.id)}
                      disabled={!o.invoiceExists}
                    >{o.invoiceExists ? "Download PDF" : "No Invoice"}
                    </button>
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

  td: { padding: "12px", borderBottom: "1px solid #e5e7eb", verticalAlign: "top" },

  itemRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    marginBottom: "4px",
  },

  qtyInput: {
    width: "60px",
  },

  deleteItemBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "red",
  },

  addRow: {
    display: "flex",
    gap: "6px",
    marginTop: "6px",
  },
};