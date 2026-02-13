import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function UploadPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const completeUploadMutation = trpc.upload.completeUpload.useMutation();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload a PDF or image (JPG/PNG).");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 10MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsProcessing(true);
    try {
      // In a real implementation, you would:
      // 1. Get a presigned URL from the backend
      // 2. Upload the file directly to S3
      // 3. Call completeUpload with the S3 URL

      // For now, we'll simulate the upload
      const fileKey = `lab-reports/${user?.id}/${Date.now()}-${selectedFile.name}`;
      const fileUrl = `https://example.com/files/${fileKey}`;

      const result = await completeUploadMutation.mutateAsync({
        fileName: selectedFile.name,
        fileUrl,
        fileKey,
        extractedText: undefined,
      });

      if (result.success) {
        toast.success("Report uploaded successfully!");
        setSelectedFile(null);
        // Redirect to results page
        setLocation(`/results/${result.reportId}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload Lab Report</h1>
        <p className="text-gray-600 mb-8">
          Upload your lab report as a PDF or image to get started
        </p>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle>Select Your Report</CardTitle>
            <CardDescription>
              Supported formats: PDF, JPG, PNG (max 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">
                Drag and drop your file here
              </h3>
              <p className="text-gray-600 mb-4">or</p>
              <label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <Button variant="outline" className="cursor-pointer">
                  Browse Files
                </Button>
              </label>
            </div>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{selectedFile.name}</h4>
                    <p className="text-sm text-gray-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900 mb-1">Privacy & Security</h4>
                <p className="text-sm text-amber-800">
                  Your lab reports are encrypted and stored securely. We never share your data with third parties.
                </p>
              </div>
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload and Analyze
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">What We Accept</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>✓ PDF lab reports</p>
              <p>✓ Scanned images (JPG, PNG)</p>
              <p>✓ Screenshots of results</p>
              <p>✓ Multiple pages</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">What We Extract</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>✓ Test names and values</p>
              <p>✓ Reference ranges</p>
              <p>✓ Units of measurement</p>
              <p>✓ Report date</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
