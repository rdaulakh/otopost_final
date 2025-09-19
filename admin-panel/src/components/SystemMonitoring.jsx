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
import useSystemMonitoring from '../hooks/useSystemMonitoring';

const SystemMonitoring = () => {
  const {
    systemMetrics,
    alerts,
    performanceData,
    errorLogs,
    slowQueries,
    loading,
    error,
    refreshAllData
  } = useSystemMonitoring();

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [showSettings, setShowSettings] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Auto-refresh functionality
  useEffect(() => {
    // Initial data load
    refreshAllData(selectedTimeRange);
    setLastRefresh(new Date());

    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshAllData(selectedTimeRange);
        setLastRefresh(new Date());
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, selectedTimeRange, refreshAllData]);

  const handleManualRefresh = async () => {
    await refreshAllData(selectedTimeRange);
    setLastRefresh(new Date());
  };

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

  const MetricCard = ({ title, value, unit, icon: Icon, color, trend, subtitle, isLoading }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative"
    >
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
        </div>
      )}
      
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
          {typeof value === 'number' ? value.toFixed(1) : value} {unit && <span className="text-sm text-gray-500">{unit}</span>}
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
            {error && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
                API Error: {error} (Showing fallback data)
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-xs text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
            
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              title="Manual refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
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
            
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
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
              value={systemMetrics.cpu.usage}
              unit="%"
              icon={CpuIcon}
              color="bg-blue-500"
              trend={5.2}
              subtitle={`${systemMetrics.cpu.cores} cores, ${systemMetrics.cpu.temperature.toFixed(1)}°C`}
              isLoading={loading}
            />
            
            <MetricCard
              title="Memory Usage"
              value={systemMetrics.memory.percentage}
              unit="%"
              icon={HardDrive}
              color="bg-green-500"
              trend={-2.1}
              subtitle={`${systemMetrics.memory.used.toFixed(1)}GB / ${systemMetrics.memory.total}GB`}
              isLoading={loading}
            />
            
            <MetricCard
              title="Disk Usage"
              value={systemMetrics.disk.percentage}
              unit="%"
              icon={Database}
              color="bg-yellow-500"
              trend={1.5}
              subtitle={`${systemMetrics.disk.used.toFixed(1)}GB / ${systemMetrics.disk.total}GB`}
              isLoading={loading}
            />
            
            <MetricCard
              title="Uptime"
              value={formatUptime(systemMetrics.uptime)}
              icon={Clock}
              color="bg-purple-500"
              subtitle="System uptime"
              isLoading={loading}
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
              isLoading={loading}
            />
            
            <MetricCard
              title="Error Rate"
              value={((systemMetrics.requests.errors / systemMetrics.requests.total) * 100)}
              unit="%"
              icon={XCircle}
              color="bg-red-500"
              trend={-0.5}
              subtitle={`${systemMetrics.requests.errors} errors`}
              isLoading={loading}
            />
            
            <MetricCard
              title="Avg Response Time"
              value={systemMetrics.responseTime.average}
              unit="ms"
              icon={Activity}
              color="bg-orange-500"
              trend={-8.2}
              subtitle={`P95: ${systemMetrics.responseTime.p95.toFixed(0)}ms, P99: ${systemMetrics.responseTime.p99.toFixed(0)}ms`}
              isLoading={loading}
            />
            
            <MetricCard
              title="Database Connections"
              value={systemMetrics.database.connections}
              icon={DatabaseIcon}
              color="bg-teal-500"
              trend={2.1}
              subtitle={`${systemMetrics.database.queries} queries/min`}
              isLoading={loading}
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
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No active alerts. System is running normally.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-64 flex items-center justify-center">
              {performanceData.length > 0 ? (
                <div className="w-full">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                  <p className="text-gray-700 text-center">Performance chart with {performanceData.length} data points</p>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Time range: {selectedTimeRange} | Last update: {lastRefresh.toLocaleTimeString()}
                  </p>
                </div>
              ) : (
                <div>
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">Loading performance data...</p>
                </div>
              )}
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
                  {errorLogs.length > 0 ? (
                    errorLogs.map((log) => (
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        {loading ? 'Loading error logs...' : 'No error logs found'}
                      </td>
                    </tr>
                  )}
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
                  {slowQueries.length > 0 ? (
                    slowQueries.map((query) => (
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        {loading ? 'Loading slow queries...' : 'No slow queries detected'}
                      </td>
                    </tr>
                  )}
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
