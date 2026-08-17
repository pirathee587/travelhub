import api from '@/services/axios';

export const adminPayoutApi = {
  getFinanceStats: async () => {
    const res = await api.get('/admin/payouts/stats');
    return res.data;
  },

  getAllPayouts: async (status?: string) => {
    const query = status ? `?status=${status}` : '';
    const res = await api.get(`/admin/payouts${query}`);
    return res.data;
  },

  approvePayout: async (id: number, slipFile?: File) => {
    const form = new FormData();
    if (slipFile) {
      form.append('file', slipFile);
    }
    const res = await api.patch(`/admin/payouts/${id}/approve`, form);
    return res.data;
  },

  rejectPayout: async (id: number, reason: string) => {
    const res = await api.patch(`/admin/payouts/${id}/reject`, { reason });
    return res.data;
  }
};

