import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Database, 
  Server, 
  Cpu, 
  HardDrive, 
  Wifi, 
  WifiOff,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings,
  BarChart3,
  LineChart,
  PieChart,
  Zap,
  Shield,
  Users,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Download,
  Filter,
  Search,
  Calendar,
  Bell,
  Eye,
  EyeOff,
  Play,
  Pause,
  Square,
  RotateCcw,
  RotateCw,
  Move,
  Resize,
  Lock,
  Unlock,
  AlertCircle,
  Info,
  HelpCircle,
  Lightbulb,
  Target,
  Brain,
  Cpu as CpuIcon,
  Database as DatabaseIcon,
  Server as ServerIcon
} from 'lucide-react';

const SystemMonitoring = () => {
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
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const generateMockData = () => {
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

      // Generate mock alerts
      const mockAlerts = [
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
          type: 'error',
          title: 'Database Connection Pool Exhausted',
          message: 'Database connection pool is at 95% capacity',
          timestamp: new Date(Date.now() - 300000),
          severity: 'high',
          resolved: false
        },
        {
          id: 3,
          type: 'info',
          title: 'Memory Usage Normal',
          message: 'Memory usage is within normal parameters',
          timestamp: new Date(Date.now() - 600000),
          severity: 'low',
          resolved: true
        }
      ];
      setAlerts(mockAlerts);

      // Generate mock performance data
      const mockPerformanceData = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000),
        cpu: 20 + Math.random() * 60,
        memory: 40 + Math.random() * 30,
        requests: 100 + Math.random() * 200,
        responseTime: 100 + Math.random() * 300
      }));
      setPerformanceData(mockPerformanceData);

      // Generate mock error logs
      const mockErrorLogs = [
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
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 600000),
          level: 'error',
          message: 'Redis connection failed',
          source: 'redis',
          userId: 'user789',
          requestId: 'req_123458'
        }
      ];
      setErrorLogs(mockErrorLogs);

      // Generate mock slow queries
      const mockSlowQueries = [
        {
          id: 1,
          query: 'SELECT * FROM users WHERE email = ?',
          duration: 2500,
          collection: 'users',
          timestamp: new Date(),
          userId: 'user123'
        },
        {
          id: 2,
          query: 'db.analytics.aggregate([...])',
          duration: 1800,
          collection: 'analytics',
          timestamp: new Date(Date.now() - 300000),
          userId: 'user456'
        }
      ];
      setSlowQueries(mockSlowQueries);
    };

    generateMockData();

    if (autoRefresh) {
      const interval = setInterval(generateMockData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getStatusColor = (value, thresholds) => {
    if (value >= thresholds.critical) return 'text-red-600 bg-red-100';
    if (value >= thresholds.warning) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return XCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const MetricCard = ({ title, value, unit, icon: Icon, color, trend, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span className="text-sm font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="text-2xl font-bold text-gray-900">
          {value} {unit && <span className="text-sm text-gray-500">{unit}</span>}
        </div>
        {subtitle && (
          <div className="text-sm text-gray-500">{subtitle}</div>
        )}
      </div>
    </motion.div>
  );

  const AlertCard = ({ alert }) => {
    const AlertIcon = getAlertIcon(alert.type);
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`p-4 rounded-lg border-l-4 ${
          alert.type === 'error' ? 'border-red-500 bg-red-50' :
          alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
          'border-blue-500 bg-blue-50'
        }`}
      >
        <div className="flex items-start space-x-3">
          <AlertIcon className={`h-5 w-5 mt-0.5 ${
            alert.type === 'error' ? 'text-red-600' :
            alert.type === 'warning' ? 'text-yellow-600' :
            'text-blue-600'
          }`} />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">{alert.title}</h4>
              <span className="text-xs text-gray-500">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {alert.severity}
              </span>
              {alert.resolved ? (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Resolved
                </span>
              ) : (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                  Active
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
            <p className="text-gray-600">Real-time system performance and health monitoring</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Auto-refresh:</label>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 rounded text-sm ${
                  autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {autoRefresh ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value={1000}>1 second</option>
              <option value={5000}>5 seconds</option>
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
            </select>
            
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* System Overview */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="CPU Usage"
              value={systemMetrics.cpu.usage.toFixed(1)}
              unit="%"
              icon={CpuIcon}
              color="bg-blue-500"
              trend={5.2}
              subtitle={`${systemMetrics.cpu.cores} cores, ${systemMetrics.cpu.temperature.toFixed(1)}°C`}
            />
            
            <MetricCard
              title="Memory Usage"
              value={systemMetrics.memory.percentage.toFixed(1)}
              unit="%"
              icon={HardDrive}
              color="bg-green-500"
              trend={-2.1}
              subtitle={`${systemMetrics.memory.used.toFixed(1)}GB / ${systemMetrics.memory.total}GB`}
            />
            
            <MetricCard
              title="Disk Usage"
              value={systemMetrics.disk.percentage.toFixed(1)}
              unit="%"
              icon={Database}
              color="bg-yellow-500"
              trend={1.5}
              subtitle={`${systemMetrics.disk.used.toFixed(1)}GB / ${systemMetrics.disk.total}GB`}
            />
            
            <MetricCard
              title="Uptime"
              value={formatUptime(systemMetrics.uptime)}
              icon={Clock}
              color="bg-purple-500"
              subtitle="System uptime"
            />
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Requests"
              value={systemMetrics.requests.total.toLocaleString()}
              icon={Globe}
              color="bg-indigo-500"
              trend={12.3}
              subtitle="Last 24 hours"
            />
            
            <MetricCard
              title="Error Rate"
              value={((systemMetrics.requests.errors / systemMetrics.requests.total) * 100).toFixed(2)}
              unit="%"
              icon={XCircle}
              color="bg-red-500"
              trend={-0.5}
              subtitle={`${systemMetrics.requests.errors} errors`}
            />
            
            <MetricCard
              title="Avg Response Time"
              value={systemMetrics.responseTime.average.toFixed(0)}
              unit="ms"
              icon={Activity}
              color="bg-orange-500"
              trend={-8.2}
              subtitle="P95: 300ms, P99: 500ms"
            />
            
            <MetricCard
              title="Database Connections"
              value={systemMetrics.database.connections}
              icon={DatabaseIcon}
              color="bg-teal-500"
              trend={2.1}
              subtitle={`${systemMetrics.database.queries} queries/min`}
            />
          </div>
        </div>

        {/* Alerts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
            <span className="text-sm text-gray-500">
              {alerts.filter(alert => !alert.resolved).length} active
            </span>
          </div>
          
          <div className="space-y-4">
            <AnimatePresence>
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Performance chart would be displayed here</p>
                <p className="text-sm text-gray-400">Integration with charting library needed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Logs */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Error Logs</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {errorLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          log.level === 'error' ? 'bg-red-100 text-red-800' :
                          log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{log.message}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.source}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.userId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Slow Queries */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Slow Queries</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Query
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Collection
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {slowQueries.map((query) => (
                    <tr key={query.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                        {query.query.length > 50 ? `${query.query.substring(0, 50)}...` : query.query}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          {query.duration}ms
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{query.collection}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(query.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitoring;

