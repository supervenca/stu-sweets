import { useEffect, useState, useRef } from "react";
import { useCategoriesStore } from "../stores/categories.store";

const CategoriesPage = () => {
  const {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategoriesStore();

  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isAddDisabled = !name.trim();
  const isSaveDisabled = !editingName.trim();



  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
  if (editingId !== null) {
    inputRef.current?.focus();
  }
}, [editingId]);


  const handleCreate = async () => {
    if (!name.trim()) return;
    await createCategory(name);
    setName("");
  };

  const handleSave = async (id: number) => {
  if (!editingName.trim()) return;

  setPendingId(id);
  await updateCategory(id, editingName);
  setPendingId(null);

  setEditingId(null);
};


  if (loading) return <div>Loading categories...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h1>
          Categories{" "}
          <span style={{ color: "#6b7280" }}>({categories.length})</span>
        </h1>
      </div>

      {/* Create */}
      <div style={{ marginBottom: 24 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
        />
        <button 
            onClick={handleCreate} 
            style={{ marginLeft: 8 }}
            disabled={isAddDisabled}>
          Add
        </button>
      </div>

      {/* Empty */}
      {categories.length === 0 ? (
        <p>No categories yet</p>
      ) : (
        <table style={tableStyles.table}>
          <thead>
            <tr>
              <th style={tableStyles.th}>ID</th>
              <th style={tableStyles.th}>Name</th>
              <th style={tableStyles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td style={tableStyles.td}>{cat.id}</td>
                <td style={tableStyles.td}>{editingId === cat.id ? (
                  <input 
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    ref={inputRef}/>
                ) : (cat.name)}
                </td>
                <td style={tableStyles.td}>
  {editingId === cat.id ? (
    <>
      <button
        onClick={() => handleSave(cat.id)}
        disabled={isSaveDisabled || pendingId === cat.id}>
          {pendingId === cat.id ? "Saving..." : "Save"}
      </button>
      {" "}
      <button
          onClick={() => {
            setEditingId(null);
            setEditingName("");
          }}>Cancel
      </button>

    </>
  ) : (
    <>
      <button
        onClick={() => {
          setEditingId(cat.id);
          setEditingName(cat.name);
        }}
      >
        Edit
      </button>{" "}
      <button
        onClick={() => {
          if (confirm("Delete this category?")) {
            deleteCategory(cat.id);
          }
        }}
      >
        Delete
      </button>
    </>
  )}
</td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CategoriesPage;

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

