import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

interface TwoFactorStatus {
  two_factor_enabled: boolean;
  enabled_methods: string[];
  primary_method: string;
  two_factor_setup_completed: boolean;
  remaining_backup_codes: number;
  trusted_devices_count: number;
  totp_verified: boolean;
  phone_verified: boolean;
  backup_email_verified: boolean;
}

interface SetupResponse {
  secret?: string;
  qr_code?: string;
  provisioning_uri?: string;
  message?: string;
}

interface BackupCodesResponse {
  backup_codes: string[];
  remaining_codes: number;
}

// Hook to get 2FA status
export const useTwoFactorStatus = () => {
  return useQuery<TwoFactorStatus>({
    queryKey: ["twoFactorStatus"],
    queryFn: async () => {
      const response = await apiClient.get("/auth/2fa/status/");
      return response.data;
    },
  });
};

// Hook to setup 2FA
export const useTwoFactorSetup = () => {
  return useMutation<SetupResponse, Error, { method: string; phone_number?: string; backup_email?: string }>({
    mutationFn: async (data) => {
      const response = await apiClient.post("/auth/2fa/setup/", data);
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to setup 2FA");
    },
  });
};

// Hook to verify 2FA setup
export const useTwoFactorVerifySetup = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; backup_codes?: string[] }, Error, { code: string; method: string }>({
    mutationFn: async (data) => {
      const response = await apiClient.post("/auth/2fa/verify-setup/", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["twoFactorStatus"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to verify 2FA setup");
    },
  });
};

// Hook to verify 2FA code
export const useTwoFactorVerify = () => {
  return useMutation<
    { message: string; token?: string },
    Error,
    {
      code?: string;
      backup_code?: string;
      device_fingerprint?: string;
    }
  >({
    mutationFn: async (data) => {
      const response = await apiClient.post("/auth/2fa/verify/", data);
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Invalid verification code");
    },
  });
};

// Hook to disable 2FA
export const useTwoFactorDisable = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, { password: string }>({
    mutationFn: async (data) => {
      const response = await apiClient.post("/auth/2fa/disable/", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["twoFactorStatus"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to disable 2FA");
    },
  });
};

// Hook to get backup codes
export const useTwoFactorBackupCodes = () => {
  return useQuery<BackupCodesResponse>({
    queryKey: ["twoFactorBackupCodes"],
    queryFn: async () => {
      const response = await apiClient.get("/auth/2fa/backup-codes/");
      return response.data;
    },
    enabled: false, // Only fetch when explicitly requested
  });
};

// Hook to regenerate backup codes
export const useTwoFactorRegenerateBackupCodes = () => {
  const queryClient = useQueryClient();

  return useMutation<BackupCodesResponse, Error, { password: string }>({
    mutationFn: async (data) => {
      const response = await apiClient.post("/auth/2fa/backup-codes/", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Backup codes regenerated successfully");
      queryClient.invalidateQueries({ queryKey: ["twoFactorBackupCodes"] });
      queryClient.invalidateQueries({ queryKey: ["twoFactorStatus"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to regenerate backup codes");
    },
  });
};

// Hook to send SMS/Email verification code
export const useTwoFactorSendCode = () => {
  return useMutation<{ message: string }, Error, { method: string; contact: string }>({
    mutationFn: async (data) => {
      const response = await apiClient.post("/auth/2fa/send-code/", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to send verification code");
    },
  });
};
