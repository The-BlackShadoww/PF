import { apiClient } from './client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  twoFactorEnabled: boolean;
  timezone: string;
}

export interface UpdateProfilePayload {
  name?: string;
  avatarUrl?: string;
  timezone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface TwoFactorSetupResponse {
  otpAuthUrl: string;
  qrCodeDataUrl: string;
}

export const usersApi = {
  getProfile: () =>
    apiClient<UserProfile>('/auth/me'),

  updateProfile: (data: UpdateProfilePayload) =>
    apiClient<UserProfile>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  changePassword: (data: ChangePasswordPayload) =>
    apiClient<{ success: boolean }>('/users/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  setup2fa: () =>
    apiClient<TwoFactorSetupResponse>('/auth/2fa/setup', { method: 'POST' }),

  enable2fa: (code: string) =>
    apiClient<{ success: boolean }>('/auth/2fa/enable', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  disable2fa: (code: string) =>
    apiClient<{ success: boolean }>('/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
};
