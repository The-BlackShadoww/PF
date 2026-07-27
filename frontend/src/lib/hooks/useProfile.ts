'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, UpdateProfilePayload, ChangePasswordPayload } from '../api/users';

export const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: usersApi.getProfile,
    staleTime: 1000 * 60 * 5,   // 5 minutes — profile rarely changes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => usersApi.updateProfile(data),
    onSuccess: () => {
      // Invalidate profile so the sidebar/header re-fetches the updated name
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordPayload) => usersApi.changePassword(data),
    // No cache invalidation needed — password change doesn't affect UI state
  });
}

export function useSetup2fa() {
  return useMutation({
    mutationFn: () => usersApi.setup2fa(),
  });
}

export function useEnable2fa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => usersApi.enable2fa(code),
    onSuccess: () => {
      // Invalidate profile so twoFactorEnabled reflects true immediately
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
    },
  });
}

export function useDisable2fa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => usersApi.disable2fa(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
    },
  });
}
