const API_BASE = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.port === '5173'
    ? 'http://localhost:5070/api'
    : '/api'
);

export function clearUserSession() {
  const keysToRemove = [
    'linkapp-token',
    'linkapp-user',
    'linkapp-custom-collections',
    'linkapp-favorites',
    'linkapp-readlater',
    'linkapp-archive',
    'linkapp-link-metadata',
  ];
  keysToRemove.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  });
}

class ApiClient {
  getToken() {
    return localStorage.getItem('linkapp-token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('linkapp-token', token);
    } else {
      localStorage.removeItem('linkapp-token');
    }
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);

      if (response.status === 401 && endpoint !== '/auth/login') {
        // Token expired or invalid - clear entire user session
        clearUserSession();
        window.dispatchEvent(new Event('linkapp-unauthorized'));
        throw new Error('Session expired. Please log in again.');
      }

      if (response.status === 204) {
        return null;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data?.message || `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      console.warn(`[API] Error on ${endpoint}:`, err.message);
      throw err;
    }
  }

  // Auth Endpoints
  async login(identifier, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    if (res?.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async register(data) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res?.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async getMe() {
    return await this.request('/auth/me');
  }

  // Collections Endpoints
  async getCollections() {
    return await this.request('/collections');
  }

  async createCollection(collectionName) {
    return await this.request('/collections', {
      method: 'POST',
      body: JSON.stringify({ collectionName }),
    });
  }

  async updateCollection(id, collectionName) {
    return await this.request(`/collections/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ collectionName }),
    });
  }

  async deleteCollection(id) {
    return await this.request(`/collections/${id}`, {
      method: 'DELETE',
    });
  }

  // Links Endpoints
  async getLinks(params = {}) {
    const query = new URLSearchParams();
    if (params.collectionId !== undefined && params.collectionId !== null) query.append('collectionId', params.collectionId);
    if (params.view) query.append('view', params.view);
    if (params.tag) query.append('tag', params.tag);
    if (params.search) query.append('search', params.search);
    if (params.sort) query.append('sort', params.sort);

    const queryString = query.toString();
    const endpoint = queryString ? `/links?${queryString}` : '/links';
    return await this.request(endpoint);
  }

  async getLinkById(id) {
    return await this.request(`/links/${id}`);
  }

  async createLink(linkData) {
    return await this.request('/links', {
      method: 'POST',
      body: JSON.stringify(linkData),
    });
  }

  async updateLink(id, linkData) {
    return await this.request(`/links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(linkData),
    });
  }

  async deleteLink(id) {
    return await this.request(`/links/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleFavorite(id) {
    return await this.request(`/links/${id}/favorite`, { method: 'PATCH' });
  }

  async toggleReadLater(id) {
    return await this.request(`/links/${id}/read-later`, { method: 'PATCH' });
  }

  async toggleArchive(id) {
    return await this.request(`/links/${id}/archive`, { method: 'PATCH' });
  }

  async toggleWatched(id) {
    return await this.request(`/links/${id}/watched`, { method: 'PATCH' });
  }

  async rateLink(id, rating) {
    return await this.request(`/links/${id}/rate`, {
      method: 'PATCH',
      body: JSON.stringify({ rating }),
    });
  }

  async seedData(seedData) {
    return await this.request('/links/seed', {
      method: 'POST',
      body: JSON.stringify(seedData),
    });
  }

  // Extended Features Endpoints
  async scrapeMetadata(url) {
    return await this.request(`/links/scrape?url=${encodeURIComponent(url)}`);
  }

  async checkDuplicate(url) {
    return await this.request(`/links/check-duplicate?url=${encodeURIComponent(url)}`);
  }

  async checkLinkStatus(url, linkId = 0) {
    return await this.request('/links/check-status', {
      method: 'POST',
      body: JSON.stringify({ url, linkId }),
    });
  }

  async executeBulkAction(data) {
    return await this.request('/links/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async batchImportLinks(links) {
    return await this.request('/links/batch-import', {
      method: 'POST',
      body: JSON.stringify(links),
    });
  }

  async getPublicCollection(collectionId) {
    return await this.request(`/collections/public/${collectionId}`);
  }
}

export const api = new ApiClient();
export default api;
