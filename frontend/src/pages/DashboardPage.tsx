"use client";

import React from "react";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";
import ScriptInputForm from "@/components/ScriptInputForm";
import CommercialQueryDisplay from "@/components/CommercialQueryDisplay";
import BudgetImpactDashboard from "@/components/BudgetImpactDashboard";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";
import LoadingSpinner from "@/components/LoadingSpinner";
import InsightsCard from "@/components/InsightsCard";
// CommercialQueryTypeChart is now imported in BudgetImpactDashboard
// import CommercialQueryTypeChart from "@/components/CommercialQueryTypeChart"; 

import { Button } from "@/components/ui/button";
import { useScriptAnalysisFlow } from "@/hooks/useScriptAnalysisFlow";

type AppStage = 'input' | 'review' | 'dashboard' | 'loading';

const DashboardPage = () => {
  const { isLoggedIn } = useAuth();
  const {
    appStage,
    currentScript,
    commercialQueries,
    budgetModel,
    loadingMessage,
    handleScriptSubmit,
    handleQueriesReviewed,
    handleReset,
    handleReviewScriptFromDashboard,
  } = useScriptAnalysisFlow();

  if (appStage === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4">
        <LoadingSpinner message={loadingMessage} />
      </div>
    );
  }

  return (
    <AppLayout>
      {appStage === 'input' && (
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center py-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg mb-8">
            <h1 className="text-4xl font-extrabold mb-3">De-risk Your Production</h1>
            <p className="text-xl mb-6 max-w-2xl mx-auto">
              Analyze your script for commercial opportunities and understand your project's financial viability *before* you start filming.
            </p>
            <Button
              onClick={() => document.getElementById('script-input-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-purple-700 hover:bg-gray-100 px-8 py-3 text-lg rounded-full shadow-md transition-all duration-300"
            >
              Start New Analysis
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="script-input-form">
            <ScriptInputForm onSubmit={handleScriptSubmit} />
            <div className="space-y-8"> {/* Wrapper for InsightsCard */}
              <InsightsCard />
              {/* CommercialQueryTypeChart is now in BudgetImpactDashboard */}
            </div>
          </div>
        </div>
      )}

      {appStage === 'review' && currentScript && (
        <CommercialQueryDisplay
          scriptText={currentScript.text}
          commercialQueries={commercialQueries}
          onReviewComplete={handleQueriesReviewed}
          onBack={handleReset}
        />
      )}

      {appStage === 'dashboard' && budgetModel && currentScript && (
        <BudgetImpactDashboard
          budgetModel={budgetModel}
          script={currentScript}
          commercialQueries={commercialQueries}
          onReset={handleReset}
          onReviewScript={handleReviewScriptFromDashboard}
        />
      )}
    </AppLayout>
  );
};

export default DashboardPage;