import api from "../api";

export async function getStatistics() {
  const res = await api.get("/statistics");
  return res.data;
}
