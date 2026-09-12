import { API_BASE_URL } from "./api";

export async function getAdminAnalytics() {
  const token = localStorage.getItem("roomie_token");

  const response = await fetch(`${API_BASE_URL}/api/admin/analytics`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }

    if (response.status === 403) {
      throw new Error("Admin access required");
    }

    throw new Error("Failed to load analytics");
  }

  return response.json();
}