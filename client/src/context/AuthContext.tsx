import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../api/client';

export type UserRole =
  | 'PLATFORM_SUPER_ADMIN'
  | 'ORG_ADMIN'
  | 'HR_DIRECTOR'
  | 'HR_MANAGER'
  | 'HR_OFFICER'
  | 'PAYROLL_MANAGER'
  | 'DEPT_MANAGER'
  | 'RECRUITER'
  | 'EMPLOYEE'
  | 'AUDITOR';

export interface OrganizationInfo {
  id: string;
  name: string;
  slug: string;
  currency: string;
  timezone: string;
  primaryColor?: string;
  logoUrl?: string;
  brandLogoUrl?: string;
  status?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  maxEmployees?: number;
  companySize?: string;
  suspendedReason?: string | null;
  rejectionReason?: string | null;
}

export interface OrganizationMembershipInfo {
  organization: OrganizationInfo;
  role: UserRole;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isSuperAdmin: boolean;
  role: UserRole;
  employeeId?: string | null;
  organization?: OrganizationInfo;
  memberships?: OrganizationMembershipInfo[];
  employee?: any;
}

export interface RegisterCompanyData {
  companyName: string;
  slug: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  password: string;
  phone?: string;
  country?: string;
  address?: string;
  companySize?: string;
  plan?: string;
  currency?: string;
  timezone?: string;
}

export interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  companyName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterUserData) => Promise<void>;
  registerCompany: (data: RegisterCompanyData) => Promise<void>;
  switchOrganization: (organizationId: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string, token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (email: string, token: string) => Promise<{ success: boolean; message: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  quickLogin: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('novahcm_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (!localStorage.getItem('novahcm_token')) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const res = await apiRequest('/auth/me');
      if (res?.data) {
        setUser({
          ...res.data,
          organization: res.data.currentOrganization,
          memberships: res.data.memberships,
        });
      }
    } catch (err) {
      console.error('Failed to restore user session:', err);
      localStorage.removeItem('novahcm_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res?.data?.token) {
      localStorage.setItem('novahcm_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
  };

  const register = async (data: RegisterUserData) => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res?.data?.token) {
      localStorage.setItem('novahcm_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
  };

  const registerCompany = async (data: RegisterCompanyData) => {
    const res = await apiRequest('/auth/register-company', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res?.data?.token) {
      localStorage.setItem('novahcm_token', res.data.token);
      setToken(res.data.token);
      setUser({
        ...res.data.user,
        organization: res.data.organization,
        memberships: [
          {
            organization: res.data.organization,
            role: res.data.user.role,
          },
        ],
      });
    }
  };

  const switchOrganization = async (organizationId: string) => {
    const res = await apiRequest('/auth/switch-org', {
      method: 'POST',
      body: JSON.stringify({ organizationId }),
    });

    if (res?.data?.token) {
      localStorage.setItem('novahcm_token', res.data.token);
      setToken(res.data.token);
      await refreshUser();
    }
  };

  const forgotPassword = async (email: string) => {
    return await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  };

  const resetPassword = async (email: string, token: string, newPassword: string) => {
    return await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, newPassword }),
    });
  };

  const verifyEmail = async (email: string, token: string) => {
    return await apiRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, token }),
    });
  };

  const resendVerification = async (email: string) => {
    return await apiRequest('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  };

  const quickLogin = async (email: string) => {
    await login(email, 'Password123!');
  };

  const logout = () => {
    localStorage.removeItem('novahcm_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        registerCompany,
        switchOrganization,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerification,
        logout,
        quickLogin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
