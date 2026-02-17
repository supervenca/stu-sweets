import { useEffect, useState } from "react";
import { useProductsStore } from "../stores/products.store";
import { useCategoriesStore } from "../stores/categories.store";
import toast from "react-hot-toast";


const ProductsPage = () => {
  const {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  } = useProductsStore();

  const { categories, fetchCategories } = useCategoriesStore();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [pendingId, setPendingId] = useState<number | null>(null);


  const [errors, setErrors] = useState<{
  name?: string;
  price?: string;
}>({});

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<{
    name: string;
    price: string;
    categoryId: number | "";
  }>({
    name: "",
    price: "",
    categoryId: "",
  });

  const [editErrors, setEditErrors] = useState<{
    name?: string;
    price?: string;
  }>({});


  const handleCreate = async () => {
  const newErrors: typeof errors = {};

  if (!name.trim()) newErrors.name = "Name is required";
  else if (/\d/.test(name)) newErrors.name = "Name must not contain numbers";

  if (!price) newErrors.price = "Price is required";
  else if (Number(price) <= 0) newErrors.price = "Price must be greater than 0";

  setErrors(newErrors);
  if (Object.keys(newErrors).length > 0) return;

  try {
    await toast.promise(
      createProduct({
        name: name.trim(),
        price: Number(price),
        categoryId: categoryId === "" ? null : Number(categoryId),
      }),
      {
        loading: "Adding product...",
        success: "Product added successfully!",
        error: "Failed to add product",
      }
    );

    setName("");
    setPrice("");
    setCategoryId("");
    setErrors({});
  } catch {console.error(error)}
};

const validateEdit = () => {
  const errors: typeof editErrors = {};

  if (!editingData.name.trim()) {
    errors.name = "Name is required";
  } else if (/\d/.test(editingData.name)) {
    errors.name = "Name must not contain numbers";
  }

  if (!editingData.price) {
    errors.price = "Price is required";
  } else if (Number(editingData.price) <= 0) {
    errors.price = "Price must be greater than 0";
  }

  setEditErrors(errors);

  return Object.keys(errors).length === 0;
};

const handleSave = async (id: number) => {
  if (!validateEdit()) return;

  const confirmed = await toast.promise(
    new Promise<boolean>((resolve) => {
      const ok = confirm("Are you sure you want to save these changes?");
      resolve(ok);
    }),
    {
      loading: "Confirming...",
      success: "",
      error: "Cancelled",
    }
  );

  if (!confirmed) return;

  setPendingId(id);

  try {
    await toast.promise(
      updateProduct(id, {
        name: editingData.name.trim(),
        price: Number(editingData.price),
        categoryId: editingData.categoryId === "" ? null : Number(editingData.categoryId),
      }),
      {
        loading: "Saving changes...",
        success: "Product updated!",
        error: "Failed to update product",
      }
    );
    setEditingId(null);
  } catch {console.error(error)}
  setPendingId(null);
};

const handleDelete = async (id: number) => {
  const confirmed = confirm("Are you sure you want to delete this product?");
  if (!confirmed) return;

  setPendingId(id);

  try {
    await toast.promise(deleteProduct(id), {
      loading: "Deleting product...",
      success: "Product deleted!",
      error: "Failed to delete product",
    });
  } catch {console.error(error)}
  setPendingId(null);
};

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>
        Products{" "}
        <span style={{ color: "#6b7280" }}>
          ({products.length})
        </span>
      </h1>

      <div style={{ marginBottom: 24 }}>
  <input
  placeholder="Product name"
  value={name}
  onChange={(e) => {
    setName(e.target.value);
    setErrors((prev) => ({ ...prev, name: undefined }));
  }}
  style={{
    marginRight: 8,
    borderColor: errors.name ? "red" : undefined,
  }}
/>
{errors.name && (
  <div style={{ color: "red", fontSize: 12 }}>{errors.name}</div>
)}

  <input
  type="number"
  placeholder="Price"
  value={price}
  onChange={(e) => {
    setPrice(e.target.value);
    setErrors((prev) => ({ ...prev, price: undefined }));
  }}
  style={{
    marginRight: 8,
    width: 120,
    borderColor: errors.price ? "red" : undefined,
  }}
/>
{errors.price && (
  <div style={{ color: "red", fontSize: 12 }}>{errors.price}</div>
)}

  <select
    value={categoryId}
    onChange={(e) =>
      setCategoryId(
        e.target.value === "" ? "" : Number(e.target.value)
      )
    }
    style={{ marginRight: 8 }}
  >
    <option value="">No category</option>
    {categories.map((cat) => (
      <option key={cat.id} value={cat.id}>
        {cat.name}
      </option>
    ))}
  </select>

  <button onClick={handleCreate}>Add product</button>
</div>

      {products.length === 0 ? (
        <p>No products yet</p>
      ) : (
        <table style={tableStyles.table}>
          <thead>
            <tr>
              <th style={tableStyles.th}>ID</th>
              <th style={tableStyles.th}>Name</th>
              <th style={tableStyles.th}>Price</th>
              <th style={tableStyles.th}>Category</th>
              <th style={tableStyles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
  {products.map((p) => {
    const isEditing = editingId === p.id;

    const isUnchanged =
      p.name === editingData.name &&
      p.price === Number(editingData.price) &&
      (p.categoryId ?? "") === editingData.categoryId;

    return (
      <tr key={p.id}>
        <td style={tableStyles.td}>{p.id}</td>

        {/* NAME */}
        <td style={tableStyles.td}>
          {isEditing ? (
            <>
              <input
                value={editingData.name}
                onChange={(e) => {
                  setEditingData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }));
                  setEditErrors((prev) => ({
                    ...prev,
                    name: undefined,
                  }));
                }}
                style={{
                  borderColor: editErrors.name ? "red" : undefined,
                }}
              />
              {editErrors.name && (
                <div style={{ color: "red", fontSize: 12 }}>
                  {editErrors.name}
                </div>
              )}
            </>
          ) : (
            p.name
          )}
        </td>

        {/* PRICE */}
        <td style={tableStyles.td}>
          {isEditing ? (
            <>
              <input
                type="number"
                value={editingData.price}
                onChange={(e) => {
                  setEditingData((prev) => ({
                    ...prev,
                    price: e.target.value,
                  }));
                  setEditErrors((prev) => ({
                    ...prev,
                    price: undefined,
                  }));
                }}
                style={{
                  width: 100,
                  borderColor: editErrors.price ? "red" : undefined,
                }}
              />
              {editErrors.price && (
                <div style={{ color: "red", fontSize: 12 }}>
                  {editErrors.price}
                </div>
              )}
            </>
          ) : (
            p.price
          )}
        </td>

        {/* CATEGORY */}
        <td style={tableStyles.td}>
          {isEditing ? (
            <select
              value={editingData.categoryId}
              onChange={(e) =>
                setEditingData((prev) => ({
                  ...prev,
                  categoryId:
                    e.target.value === ""
                      ? ""
                      : Number(e.target.value),
                }))
              }
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          ) : (
            p.category?.name ?? "—"
          )}
        </td>

        {/* ACTIONS */}
        <td style={tableStyles.td}>
          {isEditing ? (
            <>
              <button
                onClick={() => handleSave(p.id)}
                disabled={
                  pendingId === p.id || isUnchanged
                }
              >
                {pendingId === p.id ? "Saving..." : "Save"}
              </button>{" "}
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditErrors({});
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setEditingId(p.id);
                  setEditingData({
                    name: p.name,
                    price: String(p.price),
                    categoryId: p.categoryId ?? "",
                  });
                  setEditErrors({});
                }}
              >
                Edit
              </button>{" "}
              <button
                onClick={() => handleDelete(p.id)}
                disabled={pendingId === p.id}
              >
                {pendingId === p.id
                  ? "Deleting..."
                  : "Delete"}
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

export default ProductsPage;

const tableStyles: Record<string, React.CSSProperties> = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "2px solid #e5e7eb",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
  },
};
