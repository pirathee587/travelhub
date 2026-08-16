const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export const userApi = {
  changePassword: async (request: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    const token = localStorage.getItem('travelhub_token') || localStorage.getItem('token') || sessionStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/users/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(request),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to change password. Please check your current password.');
    }
    return data;
  },
};
