// API service for making HTTP requests to the backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // User API methods
  async registerUser(userData: { name: string; email: string; password: string }) {
    return this.request('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async loginUser(credentials: { email: string; password: string }) {
    return this.request('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async updateUser(userId: string, userData: { name: string; email: string }) {
    return this.request(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async updatePassword(userId: string, passwordData: { currentPassword: string; newPassword: string }) {
    return this.request(`/api/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // Group API methods
  async getGroups(userId: string) {
    return this.request(`/api/groups?userId=${userId}`);
  }

  async createGroup(groupData: { name: string; description: string; notificationEmails?: string[]; createdBy: string }) {
    return this.request('/api/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  }

  async updateGroup(groupId: string, groupData: any) {
    return this.request(`/api/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify(groupData),
    });
  }

  async addMemberToGroup(groupId: string, username: string) {
    return this.request(`/api/groups/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  async removeMemberFromGroup(groupId: string, username: string) {
    return this.request(`/api/groups/${groupId}/members/${username}`, {
      method: 'DELETE',
    });
  }

  async deleteGroup(groupId: string) {
    return this.request(`/api/groups/${groupId}`, {
      method: 'DELETE',
    });
  }

  // Expense API methods
  async getExpenses(userId: string, groupId?: string) {
    const params = new URLSearchParams({ userId });
    if (groupId) {
      params.append('groupId', groupId);
    }
    return this.request(`/api/expenses?${params.toString()}`);
  }

  async createExpense(expenseData: {
    description: string;
    amount: number;
    paidBy: string;
    participants: string[];
    date: string;
    createdBy: string;
    groupId?: string;
  }) {
    return this.request('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  }

  async updateExpense(expenseId: string, expenseData: any) {
    return this.request(`/api/expenses/${expenseId}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
  }

  async deleteExpense(expenseId: string) {
    return this.request(`/api/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();