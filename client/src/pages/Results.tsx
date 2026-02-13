import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Download, Share2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ResultsPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const reportQuery = trpc.reports.getById.useQuery(
    { reportId: parseInt(reportId || "0") },
    { enabled: !!reportId }
  );

  if (!reportId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 flex items-center justify-center">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">Invalid report ID</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (reportQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Analyzing your report...</p>
        </div>
      </div>
    );
  }

  if (reportQuery.isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Button
            variant="outline"
            onClick={() => setLocation("/history")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">Failed to load report</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const report = reportQuery.data;
  if (!report) return null;

  const labValues = report.labValues || [];
  const normalCount = labValues.filter((v) => v.status === "normal").length;
  const borderlineCount = labValues.filter((v) =>
    v.status.includes("borderline")
  ).length;
  const abnormalCount = labValues.filter(
    (v) => v.status !== "normal" && !v.status.includes("borderline")
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="outline"
              onClick={() => setLocation("/history")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>
            <h1 className="text-4xl font-bold text-gray-900">{report.fileName}</h1>
            <p className="text-gray-600 mt-2">
              Analyzed on {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-green-900">
                Normal Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">{normalCount}</div>
              <p className="text-xs text-green-700 mt-1">Everything looks healthy</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-yellow-900">
                Borderline Values
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-yellow-600">{borderlineCount}</div>
              <p className="text-xs text-yellow-700 mt-1">Worth monitoring</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-red-900">
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-600">{abnormalCount}</div>
              <p className="text-xs text-red-700 mt-1">Discuss with your doctor</p>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <Card className="border-amber-200 bg-amber-50 mb-8">
          <CardContent className="pt-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">Important Disclaimer</h4>
              <p className="text-sm text-amber-800">
                This interpretation is for educational purposes only and is not a medical diagnosis. Always consult with a qualified healthcare provider about your lab results.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Lab Results */}
        <div className="space-y-4">
          {labValues.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <p className="text-gray-600 text-center">No lab values found in this report</p>
              </CardContent>
            </Card>
          ) : (
            labValues.map((value, index) => (
              <LabResultCard key={index} value={value} />
            ))
          )}
        </div>

        {/* Next Steps */}
        <Card className="mt-12 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>What to Do Next</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">
              <strong>1. Review Results:</strong> Read through each result and its explanation carefully.
            </p>
            <p className="text-gray-700">
              <strong>2. Note Questions:</strong> Write down any questions for your healthcare provider.
            </p>
            <p className="text-gray-700">
              <strong>3. Schedule Appointment:</strong> If you have abnormal results, contact your doctor to discuss.
            </p>
            <p className="text-gray-700">
              <strong>4. Track Changes:</strong> Upload future reports to monitor trends over time.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Individual lab result card component
 */
function LabResultCard({ value }: { value: any }) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <Card
      className="border-l-4 cursor-pointer hover:shadow-md transition-shadow"
      style={{ borderLeftColor: value.color }}
      onClick={() => setShowDetails(!showDetails)}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{value.emoji}</span>
              <div>
                <h3 className="font-semibold text-gray-900">{value.testName}</h3>
                <p className="text-sm text-gray-600">
                  {value.value} {value.unit}
                </p>
              </div>
            </div>
            <p className="text-gray-700 mt-3">{value.interpretation}</p>
          </div>
          <div className="text-right ml-4">
            <span
              className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: value.color }}
            >
              {value.status.replace(/_/g, " ").toUpperCase()}
            </span>
          </div>
        </div>

        {showDetails && (
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Reference Range</p>
                <p className="font-semibold text-gray-900">
                  {value.referenceRangeLow} - {value.referenceRangeHigh} {value.unit}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Severity</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {value.severity}
                </p>
              </div>
            </div>

            {value.recommendation && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-sm text-blue-900">
                  <strong>Recommendation:</strong> {value.recommendation}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import React from "react";
