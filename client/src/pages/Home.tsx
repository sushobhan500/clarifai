import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, TrendingUp, Shield, Heart } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

/**
 * Landing page for ClarifAI
 * Calming design with soft colors and clear value proposition
 */
export default function Home() {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <DashboardHome />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
      {/* Navigation */}
      <nav className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-semibold text-gray-900">ClarifAI</span>
          </div>
          <a
            href={getLoginUrl()}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign In
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              Understand Your Lab Results
              <span className="text-blue-600"> Without Anxiety</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              ClarifAI transforms complex medical reports into clear, reassuring explanations. Upload your lab results and get instant, patient-friendly insights.
            </p>
            <div className="flex gap-4">
              <a href={getLoginUrl()}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Get Started Free
                </Button>
              </a>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Normal Results</h3>
                  <p className="text-sm text-gray-600">Everything looks healthy</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Borderline Values</h3>
                  <p className="text-sm text-gray-600">Worth monitoring</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🔴</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Needs Attention</h3>
                  <p className="text-sm text-gray-600">Discuss with your doctor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 border-t border-blue-100">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            How ClarifAI Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-blue-100 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Upload Your Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Simply upload your lab report as a PDF or image. We securely extract all the data.
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-100 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our AI instantly interprets your results and explains what they mean in plain English.
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-100 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Track Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Upload multiple reports to see how your health changes over time.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Take Control of Your Health Today
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join thousands of users who understand their lab results better
          </p>
          <a href={getLoginUrl()}>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Start Free
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>© 2026 ClarifAI. All rights reserved.</p>
          <p className="text-sm mt-2">
            Disclaimer: ClarifAI provides educational information only and is not a substitute for professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Dashboard for authenticated users
 */
function DashboardHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
      <nav className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-semibold text-gray-900">ClarifAI</span>
          </div>
          <div className="flex gap-4">
            <Link href="/upload">
              <Button variant="outline">Upload Report</Button>
            </Link>
            <Link href="/history">
              <Button variant="outline">My Reports</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Welcome Back</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-blue-100">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">0</div>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Normal Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">0</div>
            </CardContent>
          </Card>

          <Card className="border-yellow-100">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Needs Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">0</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Upload your first lab report to see your results analyzed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/upload">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload Your First Report
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
