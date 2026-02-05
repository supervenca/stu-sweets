import { useEffect, useState } from "react";
import { useProductsStore } from "../stores/products.store";
import { useCategoriesStore } from "../stores/categories.store";


const ProductsPage = () => {
  const {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
  } = useProductsStore();

  const { categories, fetchCategories } = useCategoriesStore();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");

  const handleCreate = async () => {
  if (!name.trim()) return;
  if (!price || Number(price) <= 0) return;

  await createProduct({
    name: name.trim(),
    price: Number(price),
    categoryId: categoryId === "" ? null : Number(categoryId),
  });

  setName("");
  setPrice("");
  setCategoryId("");
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
    onChange={(e) => setName(e.target.value)}
    style={{ marginRight: 8 }}
  />

  <input
    type="number"
    placeholder="Price"
    value={price}
    onChange={(e) => setPrice(e.target.value)}
    style={{ marginRight: 8, width: 120 }}
  />

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
            {products.map((p) => (
              <tr key={p.id}>
                <td style={tableStyles.td}>{p.id}</td>
                <td style={tableStyles.td}>{p.name}</td>
                <td style={tableStyles.td}>{p.price}</td>
                <td style={tableStyles.td}>
                  {p.category?.name ?? "—"}
                </td>
                <td style={tableStyles.td}>
                  <button disabled>Edit</button>{" "}
                  <button disabled>Delete</button>
                </td>
              </tr>
            ))}
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
