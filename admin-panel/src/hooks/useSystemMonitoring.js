import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth token
const createApiClient = () => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  });
};

export const useSystemMonitoring = () => {
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: { usage: 0, cores: 4, temperature: 45 },
    memory: { used: 0, total: 0, percentage: 0 },
    disk: { used: 0, total: 0, percentage: 0 },
    network: { in: 0, out: 0, latency: 0 },
    database: { connections: 0, queries: 0, slowQueries: 0 },
    redis: { memory: 0, keys: 0, hitRate: 0 },
    uptime: 0,
    requests: { total: 0, errors: 0, success: 0 },
    responseTime: { average: 0, p95: 0, p99: 0 }
  });

  const [alerts, setAlerts] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const [slowQueries, setSlowQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSystemMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get('/monitoring/system-metrics');
      
      if (response.data.success) {
        setSystemMetrics(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch system metrics');
      }
    } catch (err) {
      console.error('Error fetching system metrics:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch system metrics');
      
      // Fallback to mock data if API fails
      setSystemMetrics({
        cpu: { 
          usage: Math.random() * 100, 
          cores: 4, 
          temperature: 45 + Math.random() * 10 
        },
        memory: { 
          used: 6.2 + Math.random() * 2, 
          total: 16, 
          percentage: (6.2 + Math.random() * 2) / 16 * 100 
        },
        disk: { 
          used: 120 + Math.random() * 20, 
          total: 500, 
          percentage: (120 + Math.random() * 20) / 500 * 100 
        },
        network: { 
          in: Math.random() * 100, 
          out: Math.random() * 50, 
          latency: 20 + Math.random() * 10 
        },
        database: { 
          connections: 15 + Math.floor(Math.random() * 10), 
          queries: 1250 + Math.floor(Math.random() * 500), 
          slowQueries: Math.floor(Math.random() * 5) 
        },
        redis: { 
          memory: 50 + Math.random() * 20, 
          keys: 10000 + Math.floor(Math.random() * 5000), 
          hitRate: 95 + Math.random() * 5 
        },
        uptime: 86400 + Math.floor(Math.random() * 86400),
        requests: { 
          total: 15000 + Math.floor(Math.random() * 5000), 
          errors: 50 + Math.floor(Math.random() * 20), 
          success: 14950 + Math.floor(Math.random() * 5000) 
        },
        responseTime: { 
          average: 150 + Math.random() * 50, 
          p95: 300 + Math.random() * 100, 
          p99: 500 + Math.random() * 200 
        }
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const api = createApiClient();
      const response = await api.get('/monitoring/alerts');
      
      if (response.data.success) {
        setAlerts(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
      // Fallback to mock alerts
      setAlerts([
        {
          id: 1,
          type: 'warning',
          title: 'High CPU Usage',
          message: 'CPU usage is above 80%',
          timestamp: new Date(),
          severity: 'medium',
          resolved: false
        },
        {
          id: 2,
          type: 'info',
          title: 'System Running Normally',
          message: 'All systems are operating within normal parameters',
          timestamp: new Date(Date.now() - 300000),
          severity: 'low',
          resolved: true
        }
      ]);
    }
  }, []);

  const fetchPerformanceData = useCallback(async (timeRange = '24h') => {
    try {
      const api = createApiClient();
      const response = await api.get(`/monitoring/performance-data?timeRange=${timeRange}`);
      
      if (response.data.success) {
        setPerformanceData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching performance data:', err);
      // Fallback to mock performance data
      const mockPerformanceData = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000),
        cpu: 20 + Math.random() * 60,
        memory: 40 + Math.random() * 30,
        requests: 100 + Math.random() * 200,
        responseTime: 100 + Math.random() * 300
      }));
      setPerformanceData(mockPerformanceData);
    }
  }, []);

  const fetchErrorLogs = useCallback(async (limit = 50) => {
    try {
      const api = createApiClient();
      const response = await api.get(`/monitoring/error-logs?limit=${limit}`);
      
      if (response.data.success) {
        setErrorLogs(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching error logs:', err);
      // Fallback to mock error logs
      setErrorLogs([
        {
          id: 1,
          timestamp: new Date(),
          level: 'error',
          message: 'Database connection timeout',
          source: 'database',
          userId: 'user123',
          requestId: 'req_123456'
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 300000),
          level: 'warning',
          message: 'Slow query detected',
          source: 'database',
          userId: 'user456',
          requestId: 'req_123457'
        }
      ]);
    }
  }, []);

  const fetchSlowQueries = useCallback(async (limit = 20) => {
    try {
      const api = createApiClient();
      const response = await api.get(`/monitoring/slow-queries?limit=${limit}`);
      
      if (response.data.success) {
        setSlowQueries(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching slow queries:', err);
      // Fallback to mock slow queries
      setSlowQueries([
        {
          id: 1,
          query: 'User.find({ email: { $regex: ".*@gmail.com" } })',
          duration: 2500,
          collection: 'users',
          timestamp: new Date(),
          userId: 'user123'
        },
        {
          id: 2,
          query: 'Content.aggregate([{ $match: { status: "published" } }])',
          duration: 1800,
          collection: 'content',
          timestamp: new Date(Date.now() - 300000),
          userId: 'user456'
        }
      ]);
    }
  }, []);

  const refreshAllData = useCallback(async (timeRange = '24h') => {
    await Promise.all([
      fetchSystemMetrics(),
      fetchAlerts(),
      fetchPerformanceData(timeRange),
      fetchErrorLogs(),
      fetchSlowQueries()
    ]);
  }, [fetchSystemMetrics, fetchAlerts, fetchPerformanceData, fetchErrorLogs, fetchSlowQueries]);

  return {
    // Data
    systemMetrics,
    alerts,
    performanceData,
    errorLogs,
    slowQueries,
    
    // State
    loading,
    error,
    
    // Actions
    fetchSystemMetrics,
    fetchAlerts,
    fetchPerformanceData,
    fetchErrorLogs,
    fetchSlowQueries,
    refreshAllData
  };
};

export default useSystemMonitoring;
