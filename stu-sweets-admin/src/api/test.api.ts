import api from "./httpClient";

console.log("TEST API IMPORTED", api);

export const pingBackend = async () => {
  return "ok";
};
