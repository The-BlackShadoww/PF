import { getAccessToken } from './client';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ReportDownloadParams {
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
}

async function downloadReportBlob(
  endpoint: string,
  params: ReportDownloadParams,
): Promise<Blob> {
  const token = getAccessToken();

  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('startYear', String(params.startYear));
  url.searchParams.set('startMonth', String(params.startMonth));
  url.searchParams.set('endYear', String(params.endYear));
  url.searchParams.set('endMonth', String(params.endMonth));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });

  if (response.status === 401) {
    throw new Error('Your session has expired. Please refresh the page and try again.');
  }

  if (response.status === 429) {
    throw new Error('Download limit reached. Please wait before downloading again.');
  }

  if (!response.ok) {
    let message = `Download failed (${response.status})`;
    try {
      const errorBody = await response.json();
      message = errorBody.message ?? message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response.blob();
}

export const reportsApi = {
  downloadCsv: (params: ReportDownloadParams) =>
    downloadReportBlob('/reports/csv', params),

  downloadPdf: (params: ReportDownloadParams) =>
    downloadReportBlob('/reports/pdf', params),
};
