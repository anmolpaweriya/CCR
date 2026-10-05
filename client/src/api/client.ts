const API_BASE_URL = 'http://localhost:5000/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('ccr_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message || 'API request failed', response.status, data);
  }

  return data as T;
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiRequest<{ success: boolean; token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData: any) =>
      apiRequest<{ success: boolean; token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    getMe: () => apiRequest<{ success: boolean; user: any; wallet: any }>('/auth/me'),
  },

  user: {
    updateProfile: (data: any) =>
      apiRequest<{ success: boolean; user: any }>('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    getLeaders: () => apiRequest<{ success: boolean; helpers: any[] }>('/users/leaders'),
    getPublicProfile: (id: string) =>
      apiRequest<{ success: boolean; user: any; reviews: any[] }>(`/users/${id}`),
  },

  assistance: {
    getAll: (params?: Record<string, string>) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest<{ success: boolean; requests: any[] }>(`/assistance?${query}`);
    },
    getById: (id: string) =>
      apiRequest<{ success: boolean; request: any }>(`/assistance/${id}`),
    create: (data: any) =>
      apiRequest<{ success: boolean; request: any; message: string }>('/assistance', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    apply: (id: string) =>
      apiRequest<{ success: boolean; message: string }>(`/assistance/${id}/apply`, {
        method: 'POST',
      }),
    selectContributor: (id: string, contributorId: string) =>
      apiRequest<{ success: boolean; message: string; request: any }>(
        `/assistance/${id}/select-contributor`,
        {
          method: 'POST',
          body: JSON.stringify({ contributorId }),
        }
      ),
    updateStatus: (id: string, status: string, completionNotes?: string) =>
      apiRequest<{ success: boolean; message: string; request: any }>(
        `/assistance/${id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status, completionNotes }),
        }
      ),
    verify: (id: string) =>
      apiRequest<{ success: boolean; message: string; request: any }>(
        `/assistance/${id}/verify`,
        {
          method: 'POST',
        }
      ),
  },

  resources: {
    getAll: (params?: Record<string, string>) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest<{ success: boolean; resources: any[] }>(`/resources?${query}`);
    },
    getById: (id: string) =>
      apiRequest<{ success: boolean; resource: any }>(`/resources/${id}`),
    create: (data: any) =>
      apiRequest<{ success: boolean; resource: any; message: string }>('/resources', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    requestResource: (id: string, data: any) =>
      apiRequest<{ success: boolean; resourceRequest: any; message: string }>(
        `/resources/${id}/request`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),
    handleDecision: (requestId: string, decision: 'ACCEPT' | 'DECLINE') =>
      apiRequest<{ success: boolean; message: string }>(
        `/resources/requests/${requestId}/decision`,
        {
          method: 'POST',
          body: JSON.stringify({ decision }),
        }
      ),
    updateStatus: (requestId: string, status: string) =>
      apiRequest<{ success: boolean; message: string }>(
        `/resources/requests/${requestId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        }
      ),
    verifyReturn: (requestId: string) =>
      apiRequest<{ success: boolean; message: string }>(
        `/resources/requests/${requestId}/verify-return`,
        {
          method: 'POST',
        }
      ),
  },

  matching: {
    getMatches: (requestId: string) =>
      apiRequest<{ success: boolean; matches: any[]; requestTitle: string }>(
        `/matching/assistance/${requestId}`
      ),
  },

  valuation: {
    evaluateAssistance: (data: any) =>
      apiRequest<{ success: boolean; valuation: any }>('/valuation/assistance', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    evaluateResource: (data: any) =>
      apiRequest<{ success: boolean; valuation: any }>('/valuation/resource', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  wallet: {
    getMyWallet: () =>
      apiRequest<{ success: boolean; wallet: any; recentTransactions: any[] }>('/wallet/me'),
    getTransactions: (params?: Record<string, string>) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest<{ success: boolean; transactions: any[] }>(`/wallet/transactions?${query}`);
    },
  },

  payments: {
    processDemoPayment: (data: { credits: number; cardNumber?: string }) =>
      apiRequest<{ success: boolean; message: string; transactionId: string; wallet: any }>(
        '/payments/demo-checkout',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),
  },

  withdrawals: {
    request: (data: { amount: number; payoutMethod: string; payoutDetails: string }) =>
      apiRequest<{ success: boolean; message: string; withdrawal: any; wallet: any }>(
        '/withdrawals/request',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),
    getMyWithdrawals: () =>
      apiRequest<{ success: boolean; withdrawals: any[] }>('/withdrawals/me'),
  },

  goodwill: {
    getOpportunities: () =>
      apiRequest<{ success: boolean; opportunities: { assistance: any[]; resources: any[] } }>(
        '/goodwill/opportunities'
      ),
    getMyHistory: () =>
      apiRequest<{ success: boolean; transactions: any[] }>('/goodwill/my-history'),
  },

  notifications: {
    getAll: () =>
      apiRequest<{ success: boolean; notifications: any[]; unreadCount: number }>(
        '/notifications'
      ),
    markAsRead: (id: string) =>
      apiRequest<{ success: boolean; message: string }>(`/notifications/${id}/read`, {
        method: 'PATCH',
      }),
    markAllAsRead: () =>
      apiRequest<{ success: boolean; message: string }>('/notifications/read-all', {
        method: 'PATCH',
      }),
  },

  disputes: {
    create: (data: { type: string; referenceId: string; reason: string }) =>
      apiRequest<{ success: boolean; message: string; dispute: any }>('/disputes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getMyDisputes: () =>
      apiRequest<{ success: boolean; disputes: any[] }>('/disputes/me'),
  },

  admin: {
    getStats: () =>
      apiRequest<{ success: boolean; stats: any; chartData: any[] }>('/admin/stats'),
    getUsers: (params?: Record<string, string>) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest<{ success: boolean; users: any[] }>(`/admin/users?${query}`);
    },
    toggleSuspendUser: (id: string, reason?: string) =>
      apiRequest<{ success: boolean; message: string; user: any }>(`/admin/users/${id}/suspend`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      }),
    adjustCredits: (id: string, data: { creditType: string; amount: number; reason: string }) =>
      apiRequest<{ success: boolean; message: string; balanceAfter: number }>(
        `/admin/users/${id}/adjust-credits`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),
    getWithdrawals: () =>
      apiRequest<{ success: boolean; withdrawals: any[] }>('/admin/withdrawals'),
    handleWithdrawal: (id: string, data: { action: 'APPROVE' | 'REJECT'; reason?: string }) =>
      apiRequest<{ success: boolean; message: string }>(`/admin/withdrawals/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    getRequests: () => apiRequest<{ success: boolean; requests: any[] }>('/admin/requests'),
    getResources: () => apiRequest<{ success: boolean; resources: any[] }>('/admin/resources'),
    getDisputes: () => apiRequest<{ success: boolean; disputes: any[] }>('/admin/disputes'),
    resolveDispute: (id: string, data: { resolution: string; resolutionNotes?: string }) =>
      apiRequest<{ success: boolean; message: string }>(`/admin/disputes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    getAuditLogs: () => apiRequest<{ success: boolean; logs: any[] }>('/admin/audit-logs'),
    getGoodwillTransactions: () =>
      apiRequest<{ success: boolean; transactions: any[] }>(
        '/admin/goodwill-transactions'
      ),
  },
};
