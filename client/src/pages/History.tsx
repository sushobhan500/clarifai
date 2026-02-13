import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Calendar, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function HistoryPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const reportsQuery = trpc.reports.list.useQuery();

  const handleViewReport = (reportId: number) => {
    setLocation(`/results/${reportId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">My Lab Reports</h1>
            <p className="text-gray-600 mt-2">
              View and compare your lab reports over time
            </p>
          </div>
          <Button
            onClick={() => setLocation("/upload")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload New Report
          </Button>
        </div>

        {/* Reports List */}
        {reportsQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your reports...</p>
            </div>
          </div>
        ) : reportsQuery.isError ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">Failed to load reports</p>
            </CardContent>
          </Card>
        ) : reportsQuery.data && reportsQuery.data.length > 0 ? (
          <div className="space-y-4">
            {reportsQuery.data.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onView={() => handleViewReport(report.id)}
              />
            ))}
          </div>
        ) : (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-12 pb-12 text-center">
              <FileText className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Reports Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Upload your first lab report to get started
              </p>
              <Button
                onClick={() => setLocation("/upload")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Your First Report
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/**
 * Individual report card component
 */
function ReportCard({
  report,
  onView,
}: {
  report: any;
  onView: () => void;
}) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ Analyzed
          </span>
        );
      case "processing":
        return (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            ⏳ Processing
          </span>
        );
      case "failed":
        return (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ✗ Failed
          </span>
        );
      default:
        return (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Pending
          </span>
        );
    }
  };

  return (
    <Card className="border-gray-200 hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">{report.fileName}</h3>
              {getStatusBadge(report.status)}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(report.createdAt).toLocaleDateString()}
              </div>
              {report.testingFacility && (
                <div>{report.testingFacility}</div>
              )}
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            {report.status === "completed" && (
              <Button
                onClick={onView}
                className="bg-blue-600 hover:bg-blue-700"
              >
                View Results
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
