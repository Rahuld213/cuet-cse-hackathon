import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";

interface MetricData {
  timestamp: string;
  responseTime: number;
  successRate: number;
  errorRate: number;
  throughput: number;
}

export const PerformanceMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h">("1h");

  // Generate mock performance data
  useEffect(() => {
    const generateMockData = () => {
      const now = Date.now();
      const points = timeRange === "1h" ? 12 : timeRange === "6h" ? 24 : 48;
      const interval =
        timeRange === "1h"
          ? 5 * 60 * 1000
          : timeRange === "6h"
            ? 15 * 60 * 1000
            : 30 * 60 * 1000;

      const data: MetricData[] = [];

      for (let i = points - 1; i >= 0; i--) {
        const timestamp = new Date(now - i * interval);
        data.push({
          timestamp: timestamp.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          responseTime: Math.random() * 500 + 100, // 100-600ms
          successRate: Math.random() * 5 + 95, // 95-100%
          errorRate: Math.random() * 2, // 0-2%
          throughput: Math.random() * 50 + 10, // 10-60 req/min
        });
      }

      setMetrics(data);
    };

    generateMockData();
    const interval = setInterval(generateMockData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [timeRange]);

  const currentMetrics = metrics[metrics.length - 1] || {
    responseTime: 0,
    successRate: 0,
    errorRate: 0,
    throughput: 0,
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Performance Metrics
        </h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="1h">Last Hour</option>
          <option value="6h">Last 6 Hours</option>
          <option value="24h">Last 24 Hours</option>
        </select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-blue-500 mr-2" />
            <div>
              <div className="text-sm text-blue-600">Avg Response Time</div>
              <div className="text-lg font-semibold text-blue-900">
                {currentMetrics.responseTime.toFixed(0)}ms
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <div className="text-sm text-green-600">Success Rate</div>
              <div className="text-lg font-semibold text-green-900">
                {currentMetrics.successRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <div className="text-sm text-red-600">Error Rate</div>
              <div className="text-lg font-semibold text-red-900">
                {currentMetrics.errorRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-purple-500 mr-2" />
            <div>
              <div className="text-sm text-purple-600">Throughput</div>
              <div className="text-lg font-semibold text-purple-900">
                {currentMetrics.throughput.toFixed(0)} req/min
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Response Time Chart */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Response Time Trend
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{
                  value: "Response Time (ms)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                formatter={(value: number) => [
                  `${value.toFixed(0)}ms`,
                  "Response Time",
                ]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="responseTime"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Success vs Error Rate */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Success vs Error Rate
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{
                  value: "Rate (%)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}%`,
                  name === "successRate" ? "Success Rate" : "Error Rate",
                ]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Bar dataKey="successRate" fill="#10b981" name="successRate" />
              <Bar dataKey="errorRate" fill="#ef4444" name="errorRate" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Performance Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Average Response Time:</div>
            <div className="font-medium">
              {metrics.length > 0
                ? (
                    metrics.reduce((sum, m) => sum + m.responseTime, 0) /
                    metrics.length
                  ).toFixed(0)
                : 0}
              ms
            </div>
          </div>
          <div>
            <div className="text-gray-600">Peak Throughput:</div>
            <div className="font-medium">
              {metrics.length > 0
                ? Math.max(...metrics.map((m) => m.throughput)).toFixed(0)
                : 0}{" "}
              req/min
            </div>
          </div>
          <div>
            <div className="text-gray-600">Uptime:</div>
            <div className="font-medium text-green-600">99.9%</div>
          </div>
          <div>
            <div className="text-gray-600">Total Requests:</div>
            <div className="font-medium">
              {metrics.length > 0
                ? Math.round(metrics.reduce((sum, m) => sum + m.throughput, 0))
                : 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
