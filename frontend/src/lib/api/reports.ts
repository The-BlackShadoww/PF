import { getAccessToken } from "./client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export const reportsApi = {
  async downloadCsv(params: { startDate: string; endDate: string }): Promise<Blob> {
    const url = new URL(`${API_BASE_URL}/reports/csv`);
    url.searchParams.set("startDate", params.startDate);
    url.searchParams.set("endDate", params.endDate);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to download CSV: ${response.statusText}`);
    }

    return response.blob();
  },

  async downloadPdf(params: { startDate: string; endDate: string }): Promise<Blob> {
    const url = new URL(`${API_BASE_URL}/reports/pdf`);
    url.searchParams.set("startDate", params.startDate);
    url.searchParams.set("endDate", params.endDate);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }

    return response.blob();
  },
};
