import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, BookOpen } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function GlossaryPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  const searchQuery = trpc.glossary.search.useQuery(
    { query: searchTerm },
    { enabled: searchTerm.length > 0 }
  );

  const termQuery = trpc.glossary.getTerm.useQuery(
    { term: selectedTerm || "" },
    { enabled: !!selectedTerm }
  );

  const commonTerms = [
    "Hemoglobin",
    "Glucose",
    "Cholesterol",
    "Creatinine",
    "Albumin",
    "Potassium",
    "Sodium",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Medical Glossary</h1>
          <p className="text-gray-600">
            Understand medical terms and lab test abbreviations
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search for a medical term..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 text-base"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Search Results / Common Terms */}
          <div className="md:col-span-1">
            <Card className="border-blue-100 sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">
                  {searchTerm ? "Search Results" : "Common Terms"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {searchTerm && searchQuery.isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : searchTerm && searchQuery.data && searchQuery.data.length > 0 ? (
                  searchQuery.data.map((term) => (
                    <button
                      key={term.id}
                      onClick={() => setSelectedTerm(term.term)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedTerm === term.term
                          ? "bg-blue-100 text-blue-900 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {term.term}
                      {term.abbreviation && (
                        <span className="text-xs text-gray-600 ml-2">
                          ({term.abbreviation})
                        </span>
                      )}
                    </button>
                  ))
                ) : searchTerm ? (
                  <p className="text-sm text-gray-600 py-4">No results found</p>
                ) : (
                  commonTerms.map((term) => (
                    <button
                      key={term}
                      onClick={() => setSelectedTerm(term)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedTerm === term
                          ? "bg-blue-100 text-blue-900 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {term}
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Term Details */}
          <div className="md:col-span-2">
            {selectedTerm ? (
              termQuery.isLoading ? (
                <Card className="border-blue-100">
                  <CardContent className="pt-12 pb-12 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </CardContent>
                </Card>
              ) : termQuery.data ? (
                <Card className="border-blue-100">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl">
                          {(termQuery.data as any).term}
                        </CardTitle>
                        {(termQuery.data as any).abbreviation && (
                          <CardDescription className="text-base mt-2">
                            Abbreviation: <span className="font-mono font-semibold text-gray-900">{(termQuery.data as any).abbreviation}</span>
                          </CardDescription>
                        )}
                      </div>
                      {(termQuery.data as any).category && (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {(termQuery.data as any).category}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {(termQuery.data as any).plainEnglish && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          In Plain English
                        </h3>
                        <p className="text-gray-700 text-lg">
                          {(termQuery.data as any).plainEnglish}
                        </p>
                      </div>
                    )}

                    {(termQuery.data as any).definition && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Medical Definition
                        </h3>
                        <p className="text-gray-700">
                          {typeof (termQuery.data as any).definition === 'string' ? (termQuery.data as any).definition : JSON.stringify((termQuery.data as any).definition)}
                        </p>
                      </div>
                    )}

                    {(termQuery.data as any).source === "ai" && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          This definition was generated by AI. For medical accuracy, please consult with a healthcare provider.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-gray-200">
                  <CardContent className="pt-12 pb-12 text-center">
                    <p className="text-gray-600">Term not found</p>
                  </CardContent>
                </Card>
              )
            ) : (
              <Card className="border-blue-100 bg-blue-50">
                <CardContent className="pt-12 pb-12 text-center">
                  <BookOpen className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Select a Term
                  </h3>
                  <p className="text-gray-600">
                    Choose a term from the list to see its definition
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
