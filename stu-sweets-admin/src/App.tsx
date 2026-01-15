import React, { useEffect, useState } from "react";
import { pingBackend } from "./api/test.api";

const App = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    pingBackend()
      .then(data => setMessage(data))
      .catch(err => setMessage("Ошибка: " + err.message));
  }, []);

  return (
    <div>
      <h1>Админка Stu Sweets</h1>
      <p>Бэкенд ответил: {message}</p>
    </div>
  );
};

export default App;

