const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('travelhub_token') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const adminPayoutApi = {
  getFinanceStats: async () => {
    const res = await fetch(`${BASE_URL}/api/admin/payouts/stats`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    return res.json();
  },

  getAllPayouts: async (status?: string) => {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${BASE_URL}/api/admin/payouts${query}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    return res.json();
  },

  approvePayout: async (id: number, slipFile?: File) => {
    const form = new FormData();
    if (slipFile) {
      form.append('file', slipFile);
    }
    const token = localStorage.getItem('travelhub_token') || localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(`${BASE_URL}/api/admin/payouts/${id}/approve`, {
      method: 'PATCH',
      headers,
      body: form
    });
    return res.json();
  },

  rejectPayout: async (id: number, reason: string) => {
    const res = await fetch(`${BASE_URL}/api/admin/payouts/${id}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ reason })
    });
    return res.json();
  }
};
