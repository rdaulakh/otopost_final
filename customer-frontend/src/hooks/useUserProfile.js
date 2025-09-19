import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../config/api';

// Get user profile
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await api.get('/user-profile');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileData) => {
      const response = await api.put('/user-profile', profileData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

// Update notification preferences
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (preferences) => {
      const response = await api.put('/user-profile/notifications', preferences);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

// Update user preferences
export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (preferences) => {
      const response = await api.put('/user-profile/preferences', preferences);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

// Upload avatar
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (avatarFile) => {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const response = await api.post('/user-profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

// Delete user account
export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: async (confirmPassword) => {
      const response = await api.delete('/user-profile/account', {
        data: { confirmPassword }
      });
      return response.data;
    },
  });
};

// Get user activity log
export const useUserActivity = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['userActivity', page, limit],
    queryFn: async () => {
      const response = await api.get(`/user-profile/activity?page=${page}&limit=${limit}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
