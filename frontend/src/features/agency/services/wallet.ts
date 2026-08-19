const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8080/api" : "");

const getAgentUserId = (): string => {
  const userStr = localStorage.getItem('travelhub_user') || localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return String(user.id || user.userId || user.ownerId || '');
    } catch (e) {
      return '';
    }
  }
  return '';
};

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('travelhub_token') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const walletApi = {
  getWallet: async () => {
    const userId = getAgentUserId();
    const res = await fetch(`${BASE_URL}/agency/wallet/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    return res.json();
  },

  getPayoutRequests: async () => {
    const userId = getAgentUserId();
    const res = await fetch(`${BASE_URL}/agency/wallet/${userId}/payouts`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    return res.json();
  },

  requestPayout: async (data: { amount: number; bankName: string; accountNo: string; accountHolderName: string; branchName?: string }) => {
    const userId = getAgentUserId();
    const res = await fetch(`${BASE_URL}/agency/wallet/${userId}/payouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};
