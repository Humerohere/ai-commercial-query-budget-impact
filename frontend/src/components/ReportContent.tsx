"use client";

import React from "react";
import { BudgetModel, CommercialQuery, Script } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface ReportContentProps {
  script: Script;
  budgetModel: BudgetModel;
  commercialQueries: CommercialQuery[];
}

const ReportContent: React.FC<ReportContentProps> = ({
  script,
  budgetModel,
  commercialQueries,
}) => {
  if (!script || !budgetModel) {
    return <div className="text-center p-8 text-gray-500">Report data unavailable.</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const netImpactColor = (budgetModel.netImpact || 0) >= 0 ? "text-green-600" : "text-red-600";

  return (
    <div className="p-8 bg-white text-gray-900 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      <h1 className="text-3xl font-bold mb-6 text-center">AI Commercial Query & Budget Impact Report</h1>
      <p className="text-lg text-gray-700 mb-8 text-center">
        Report for: <span className="font-semibold">{script.title}</span>
      </p>

      {/* Script Parameters */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Script Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
          <div>
            <p><span className="font-medium">Target Production Budget:</span> {formatCurrency(script.params.targetProductionBudget)}</p>
            <p><span className="font-medium">Target Audience:</span> {script.params.targetAudience}</p>
          </div>
          <div>
            <p><span className="font-medium">Creative Flexibility:</span> {script.params.creativeFlexibility.replace(/-/g, ' ')}</p>
            {script.params.creativeDirectionNotes && (
              <p><span className="font-medium">Creative Notes:</span> {script.params.creativeDirectionNotes}</p>
            )}
          </div>
        </div>
      </section>

      {/* Budget Impact Summary */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Budget Impact Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="text-sm text-gray-600">Production Budget</p>
            <p className="text-2xl font-bold">{formatCurrency(budgetModel.productionBudget)}</p>
          </div>
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="text-sm text-gray-600">Projected Revenue</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(budgetModel.totalProjectedRevenue)}</p>
          </div>
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className={`text-sm text-gray-600`}>Net Impact</p>
            <p className={`text-2xl font-bold ${netImpactColor}`}>{formatCurrency(budgetModel.netImpact)}</p>
            <Badge variant={budgetModel.netImpact >= 0 ? "secondary" : "destructive"} className="mt-2">
              {budgetModel.netImpact >= 0 ? "Projected Profit" : "Projected Loss"}
            </Badge>
          </div>
        </div>
        <div className="mt-6 space-y-2 text-gray-800">
          <div className="flex justify-between">
            <span className="font-medium">Baseline AdSense Revenue:</span>
            <span>{formatCurrency(budgetModel.baselineAdsenseRevenue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Potential Sponsorship Revenue:</span>
            <span>{formatCurrency(budgetModel.potentialSponsorshipRevenue)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total Projected Revenue:</span>
            <span>{formatCurrency(budgetModel.totalProjectedRevenue)}</span>
          </div>
        </div>
      </section>

      {/* Sponsorship Breakdown by Category */}
      {budgetModel.categoryBreakdown && Object.keys(budgetModel.categoryBreakdown).length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Sponsorship Breakdown by Category</h2>
          <div className="space-y-2 text-gray-800">
            {Object.entries(budgetModel.categoryBreakdown).map(([category, amount]) => (
              <div key={category} className="flex justify-between">
                <span className="font-medium">{category}:</span>
                <span>{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Commercial Queries */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Commercial Opportunities</h2>
        {commercialQueries.length === 0 ? (
          <p className="text-gray-600">No commercial queries were detected or accepted for this script.</p>
        ) : (
          <div className="space-y-4">
            {commercialQueries.map((query) => (
              <div key={query.id} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center mb-2">
                  <span className="font-bold text-lg mr-2">{query.term}</span>
                  <Badge variant="secondary" className="mr-2">{query.type}</Badge>
                  <Badge variant={query.status === 'accepted' ? 'default' : 'destructive'}>
                    {query.status === 'accepted' ? 'Accepted' : 'Rejected'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 mb-2">{query.reason}</p>
                <p className="text-sm text-gray-500 italic mb-2">Excerpt: "{query.scriptExcerpt}"</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-md font-medium text-gray-800">Estimated Revenue: {formatCurrency(query.estimatedRevenue)}</p>
                  <p className="text-md font-medium text-gray-800">Confidence: {query.confidenceScore}%</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="text-center text-gray-500 text-sm mt-10 pt-4 border-t">
        Generated by AI Commercial Query Detection & Budget Impact Tool
      </footer>
    </div>
  );
};

export default ReportContent;