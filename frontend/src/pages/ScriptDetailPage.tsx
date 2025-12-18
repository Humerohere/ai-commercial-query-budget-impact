"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { SavedScriptAnalysis } from "@/types";
import { useSavedScripts } from "@/hooks/useSavedScripts";
import LoadingSpinner from "@/components/LoadingSpinner";
import { showError } from "@/utils/toast";
import ReportContent from "@/components/ReportContent";
import HighlightedScript from "@/components/HighlightedScript";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import RevenueChart from "@/components/RevenueChart";
import CategoryDistributionChart from "@/components/CategoryDistributionChart";
import CommercialQueryTypeChart from "@/components/CommercialQueryTypeChart";

const ScriptDetailPage: React.FC = () => {
  const { scriptId } = useParams<{ scriptId: string }>();
  const navigate = useNavigate();
  const { allScripts, loading } = useSavedScripts();
  const [analysis, setAnalysis] = useState<SavedScriptAnalysis | null>(null);

  useEffect(() => {
    if (!loading) {
      if (scriptId) {
        const savedAnalysis = allScripts.find(a => a.script.id === scriptId);
        if (savedAnalysis) {
          setAnalysis(savedAnalysis);
        } else {
          showError("Script analysis not found.");
          navigate('/my-scripts');
        }
      } else {
        showError("No script ID provided.");
        navigate('/my-scripts');
      }
    }
  }, [scriptId, navigate, allScripts, loading]);

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[calc(100vh-150px)] flex items-center justify-center">
          <LoadingSpinner message="Loading script analysis..." />
        </div>
      </AppLayout>
    );
  }

  if (!analysis) {
    return null; // Should be redirected by now
  }

  // Dummy function for onToggleQueryStatus as this page is read-only
  const handleToggleStatusReadOnly = () => {
    showError("This is a read-only report. Please go to 'Review Script' to make changes.");
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => navigate('/my-scripts')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Scripts
          </Button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center flex-grow">
            Report for: {analysis.script.title}
          </h2>
          <div className="w-24"></div> {/* Spacer to balance the back button */}
        </div>

        {/* Budget Impact Summary */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">Budget Impact Summary</h3>
          <ReportContent
            script={analysis.script}
            budgetModel={analysis.budgetModel}
            commercialQueries={analysis.commercialQueries}
          />
        </section>

        {/* Charts Section */}
        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Comparison</CardTitle>
              <CardDescription>Visualizing budget vs. projected revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart budgetModel={analysis.budgetModel} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Sponsorship Category Distribution</CardTitle>
              <CardDescription>Visual breakdown of revenue by opportunity type</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryDistributionChart categoryBreakdown={analysis.budgetModel.categoryBreakdown} />
            </CardContent>
          </Card>
          <div className="md:col-span-2">
            <CommercialQueryTypeChart commercialQueries={analysis.commercialQueries} />
          </div>
        </section>

        {/* Highlighted Script Section */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">Script with Commercial Highlights</h3>
          <Card>
            <CardHeader>
              <CardTitle>Full Script</CardTitle>
              <CardDescription>Detected opportunities are highlighted below.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] overflow-y-auto p-4 border rounded-md bg-gray-50 dark:bg-gray-700">
                <HighlightedScript
                  scriptText={analysis.script.text}
                  commercialQueries={analysis.commercialQueries}
                  onToggleQueryStatus={handleToggleStatusReadOnly} // Read-only
                />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppLayout>
  );
};

export default ScriptDetailPage;