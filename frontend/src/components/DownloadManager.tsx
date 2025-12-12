import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, DownloadJob } from "../lib/api";
import {
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { getCurrentTraceId } from "../lib/telemetry";

export const DownloadManager: React.FC = () => {
  const [fileId, setFileId] = useState<string>("70000");
  const [activeJobs, setActiveJobs] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // Start download mutation
  const startDownloadMutation = useMutation({
    mutationFn: (fileId: number) => api.startDownload(fileId),
    onSuccess: (data) => {
      setActiveJobs((prev) => new Set(prev).add(data.jobId));
      // Start polling for this job
      pollJobStatus(data.jobId);
    },
  });

  // Poll job status
  const pollJobStatus = (jobId: string) => {
    const poll = async () => {
      try {
        const status = await api.getDownloadStatus(jobId);

        // Update query cache
        queryClient.setQueryData(["downloadJob", jobId], status);

        // Continue polling if not finished
        if (status.status === "queued" || status.status === "processing") {
          setTimeout(poll, 2000);
        } else {
          // Remove from active jobs when finished
          setActiveJobs((prev) => {
            const newSet = new Set(prev);
            newSet.delete(jobId);
            return newSet;
          });
        }
      } catch (error) {
        console.error("Polling error:", error);
        setTimeout(poll, 5000); // Retry after 5 seconds on error
      }
    };

    poll();
  };

  const handleStartDownload = () => {
    const id = parseInt(fileId);
    if (isNaN(id) || id < 10000 || id > 100000000) {
      alert("Please enter a valid file ID (10,000 - 100,000,000)");
      return;
    }

    startDownloadMutation.mutate(id);
  };

  const handleSentryTest = async () => {
    try {
      await api.triggerSentryTest(parseInt(fileId));
    } catch (error) {
      // This is expected - the error should appear in Sentry
      console.log("Sentry test error triggered (this is expected)");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Download Manager
      </h2>

      {/* Download Controls */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            value={fileId}
            onChange={(e) => setFileId(e.target.value)}
            placeholder="Enter file ID (e.g., 70000)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="10000"
            max="100000000"
          />
          <button
            onClick={handleStartDownload}
            disabled={startDownloadMutation.isPending}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {startDownloadMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Start Download
          </button>
          <button
            onClick={handleSentryTest}
            className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Test Sentry Error
          </button>
        </div>

        {/* Current Trace ID */}
        <div className="mt-2 text-xs text-gray-500">
          Current Trace ID: {getCurrentTraceId() || "None"}
        </div>
      </div>

      {/* Active Downloads */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Active Downloads</h3>
        {activeJobs.size === 0 ? (
          <p className="text-sm text-gray-500">No active downloads</p>
        ) : (
          Array.from(activeJobs).map((jobId) => (
            <DownloadJobCard key={jobId} jobId={jobId} />
          ))
        )}
      </div>
    </div>
  );
};

interface DownloadJobCardProps {
  jobId: string;
}

const DownloadJobCard: React.FC<DownloadJobCardProps> = ({ jobId }) => {
  const { data: job, isLoading } = useQuery({
    queryKey: ["downloadJob", jobId],
    queryFn: () => api.getDownloadStatus(jobId),
    refetchInterval: (data) => {
      // Stop refetching when job is complete
      return data?.status === "completed" || data?.status === "failed"
        ? false
        : 2000;
    },
  });

  const getStatusIcon = () => {
    if (isLoading || !job)
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;

    switch (job.status) {
      case "queued":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    if (!job) return "border-gray-200";

    switch (job.status) {
      case "queued":
        return "border-yellow-200 bg-yellow-50";
      case "processing":
        return "border-blue-200 bg-blue-50";
      case "completed":
        return "border-green-200 bg-green-50";
      case "failed":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200";
    }
  };

  if (!job && !isLoading) return null;

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {getStatusIcon()}
          <span className="ml-2 text-sm font-medium">
            File ID: {job?.file_id || "Loading..."}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          Job: {jobId.slice(0, 8)}...
        </span>
      </div>

      {job && (
        <>
          <div className="text-sm text-gray-600 mb-2">
            Status: <span className="font-medium capitalize">{job.status}</span>
          </div>

          {job.status === "processing" && job.progress !== undefined && (
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{job.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${job.progress || 0}%` }}
                />
              </div>
            </div>
          )}

          {job.processingTimeMs && (
            <div className="text-xs text-gray-500 mb-2">
              Processing time: {(job.processingTimeMs / 1000).toFixed(1)}s
            </div>
          )}

          {job.status === "completed" && job.result?.downloadUrl && (
            <a
              href={job.result.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Download File
            </a>
          )}

          {job.status === "failed" && job.error && (
            <div className="text-sm text-red-600">Error: {job.error}</div>
          )}
        </>
      )}
    </div>
  );
};
