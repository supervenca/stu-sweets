import React, { useEffect, useState } from "react";
import httpClient from "../api/httpClient"; 

interface User {
  id: number;
  email: string;
  role: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await httpClient.get("/internal/users");
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(u => (
          <li key={u.id}>
            {u.email} — {u.role}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;
