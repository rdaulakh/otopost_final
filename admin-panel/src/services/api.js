// Main API Service
import { apiConfig, HTTP_STATUS, HTTP_METHODS } from '../config/api.js';
import { STORAGE_KEYS, RETRY_CONFIG } from '../config/constants.js';
import { debugLog } from '../config/environment.js';

class ApiService {
  constructor() {
    this.baseURL = apiConfig.baseURL;
    this.timeout = apiConfig.timeout;
    this.defaultHeaders = apiConfig.headers;
  }

  // Get stored token
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  // Get refresh token
  getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  // Set token
  setToken(token) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  // Set refresh token
  setRefreshToken(token) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  // Clear tokens
  clearTokens() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  // Build headers with authentication
  buildHeaders(customHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    const token = this.getToken();
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Build URL
  buildUrl(endpoint) {
    return `${this.baseURL}${endpoint}`;
  }

  // Handle response
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = new Error(data.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  // Retry logic
  async withRetry(fn, retries = RETRY_CONFIG.MAX_RETRIES) {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error)) {
        debugLog(`Retrying request, ${retries} attempts left`);
        await this.delay(RETRY_CONFIG.RETRY_DELAY);
        return this.withRetry(fn, retries - 1);
      }
      throw error;
    }
  }

  // Check if should retry
  shouldRetry(error) {
    return error.status >= 500 || error.name === 'NetworkError';
  }

  // Delay utility
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const {
      method = HTTP_METHODS.GET,
      body,
      headers: customHeaders = {},
      timeout = this.timeout,
      ...otherOptions
    } = options;

    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders(customHeaders);

    const config = {
      method,
      headers,
      ...otherOptions,
    };

    if (body && method !== HTTP_METHODS.GET) {
      config.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    debugLog(`API Request: ${method} ${url}`, config);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await this.withRetry(async () => {
        return fetch(url, { ...config, signal: controller.signal });
      });

      clearTimeout(timeoutId);
      const data = await this.handleResponse(response);
      
      debugLog(`API Response: ${method} ${url}`, data);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }

      // Handle 401 Unauthorized - attempt token refresh
      if (error.status === HTTP_STATUS.UNAUTHORIZED) {
        try {
          await this.refreshToken();
          // Retry the original request with new token
          return this.request(endpoint, options);
        } catch (refreshError) {
          this.clearTokens();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      debugLog(`API Error: ${method} ${url}`, error);
      throw error;
    }
  }

  // Refresh token
  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(this.buildUrl('/auth/refresh'), {
      method: HTTP_METHODS.POST,
      headers: this.defaultHeaders,
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    this.setToken(data.data.accessToken);
    
    if (data.data.refreshToken) {
      this.setRefreshToken(data.data.refreshToken);
    }

    return data;
  }

  // HTTP Methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: HTTP_METHODS.GET });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: HTTP_METHODS.POST, body });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: HTTP_METHODS.PUT, body });
  }

  async patch(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: HTTP_METHODS.PATCH, body });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: HTTP_METHODS.DELETE });
  }

  // File upload
  async uploadFile(endpoint, file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);

    const headers = this.buildHeaders();
    delete headers['Content-Type']; // Let browser set it for FormData

    return this.request(endpoint, {
      ...options,
      method: HTTP_METHODS.POST,
      body: formData,
      headers,
    });
  }

  // Download file
  async downloadFile(endpoint, filename) {
    const response = await fetch(this.buildUrl(endpoint), {
      headers: this.buildHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;

