import { useEffect, useState } from "react";
import { useUsersStore } from "../stores/users.store";


const UsersPage = () => {
  const {
    users,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    loading,
  } = useUsersStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");
  const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] =
    useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) return;

    if (!isValidEmail(email)) {
    alert("Invalid email");
    return;
  }

    await createUser({ email, password, role });

    setEmail("");
    setPassword("");
    setRole("ADMIN");
  };

  const startEdit = (user: { id: number; email: string; role: "ADMIN" | "SUPER_ADMIN" }) => {
    setEditingUserId(user.id);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditPassword("");
  };

  const cancelEdit = () => {
    setEditingUserId(null);
  };

  const saveEdit = async (id: number) => {
    if (!isValidEmail(editEmail)) {
    alert("Invalid email");
    return;
    }
    await updateUser(id, {
      email: editEmail,
      role: editRole,
      ...(editPassword && { password: editPassword }),
    });

    setEditingUserId(null);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Users</h1>

      {/* CREATE */}
      <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value as "ADMIN" | "SUPER_ADMIN")
          }
        >
          <option value="ADMIN">ADMIN</option>
          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
        </select>

        <button type="submit">Add User</button>
      </form>

      {/* TABLE */}
      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Password</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => {
            const isEditing = editingUserId === u.id;

            return (
              <tr key={u.id}>
                <td>{u.id}</td>

                {/* EMAIL */}
                <td>
                  {isEditing ? (
                    <input
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  ) : (
                    u.email
                  )}
                </td>

                {/* PASSWORD */}
                <td>
                  {isEditing ? (
                    <input
                      type="password"
                      placeholder="New password"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                    />
                  ) : (
                    "••••••"
                  )}
                </td>

                {/* ROLE */}
                <td>
                  {isEditing ? (
                    <select
                      value={editRole}
                      onChange={(e) =>
                        setEditRole(
                          e.target.value as "ADMIN" | "SUPER_ADMIN"
                        )
                      }
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                  ) : (
                    u.role
                  )}
                </td>

                {/* ACTIONS */}
                <td>
                  {isEditing ? (
                    <>
                      <button onClick={() => saveEdit(u.id)}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(u)}>Edit</button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this user?")) {
                            deleteUser(u.id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UsersPage;