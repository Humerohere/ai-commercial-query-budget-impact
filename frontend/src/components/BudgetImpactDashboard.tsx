"use client";

import React, { useState } from "react";
import { BudgetModel, CommercialQuery, Script } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ReportContent from "./ReportContent";
import RevenueChart from "./RevenueChart";
import CategoryDistributionChart from "./CategoryDistributionChart"; // Import the new chart component
import CommercialQueryTypeChart from "./CommercialQueryTypeChart"; // Import the CommercialQueryTypeChart
import { Loader2, Download, CheckCircle2, XCircle, Lightbulb, BookText, Users, DollarSign, ShieldCheck, Sparkles } from "lucide-react"; // Added icons

interface BudgetImpactDashboardProps {
  budgetModel: BudgetModel;
  script: Script;
  commercialQueries: CommercialQuery[];
  onReset: () => void;
  onReviewScript: () => void;
}

const BudgetImpactDashboard: React.FC<BudgetImpactDashboardProps> = ({
  budgetModel,
  script,
  commercialQueries,
  onReset,
  onReviewScript,
}) => {
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const netImpactColor = budgetModel.netImpact >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  const netImpactBadge = budgetModel.netImpact >= 0 ? "default" : "destructive"; // Corrected badge variant

  // Calculate query summary
  const totalQueries = commercialQueries.length;
  const acceptedQueries = commercialQueries.filter(q => q.status === 'accepted').length;
  const rejectedQueries = commercialQueries.filter(q => q.status === 'rejected').length; // Corrected declaration

  const handleDownloadReport = async () => {
    setIsDownloadingPDF(true);
    const input = document.getElementById('report-content');
    if (!input) {
      console.error("Report content element not found.");
      setIsDownloadingPDF(false);
      return;
    }

    input.style.display = 'block';
    input.style.position = 'absolute';
    input.style.left = '-9999px';

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        windowWidth: input.scrollWidth,
        windowHeight: input.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${script.title.replace(/[^a-z0-9]/gi, '_')}_Budget_Impact_Report.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      input.style.display = 'none';
      input.style.position = 'static';
      setIsDownloadingPDF(false);
    }
  };

  const handleDownloadCSV = () => {
    setIsDownloadingCSV(true);
    if (commercialQueries.length === 0) {
      alert("No commercial queries to export.");
      setIsDownloadingCSV(false);
      return;
    }

    const headers = [
      "ID", "Term", "Type", "Reason", "Estimated Revenue", "Status",
      "Confidence Score", "Script Excerpt", "Start Index", "End Index"
    ];

    const rows = commercialQueries.map(query => [
      `"${query.id}"`,
      `"${query.term}"`,
      `"${query.type}"`,
      `"${query.reason.replace(/"/g, '""')}"`,
      query.estimatedRevenue.toFixed(2),
      `"${query.status}"`,
      query.confidenceScore,
      `"${query.scriptExcerpt.replace(/"/g, '""')}"`,
      query.startIndex,
      query.endIndex,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${script.title.replace(/[^a-z0-9]/gi, '_')}_Commercial_Queries.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setIsDownloadingCSV(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white text-center">Budget Impact Analysis</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
        Insights for: <span className="font-semibold">{script.title}</span>
      </p>

      {/* New: Script Overview Card */}
      <Card className="mb-8 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800 dark:text-blue-200">
            <BookText className="mr-2 h-5 w-5" />
            Script Overview
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">Key parameters for this analysis</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-blue-900 dark:text-blue-100 text-sm">
          <div className="flex items-center">
            <DollarSign className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium">Budget:</span> {formatCurrency(script.params.targetProductionBudget)}
          </div>
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium">Audience:</span> {script.params.targetAudience}
          </div>
          <div className="flex items-center col-span-full">
            <Lightbulb className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium">Flexibility:</span> {script.params.creativeFlexibility.replace(/-/g, ' ')}
          </div>
          {script.params.creativeDirectionNotes && (
            <div className="col-span-full text-xs text-blue-800 dark:text-blue-200 italic">
              Notes: "{script.params.creativeDirectionNotes}"
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Production Budget</CardTitle>
            <CardDescription>Your estimated project costs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(budgetModel.productionBudget)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projected Revenue</CardTitle>
            <CardDescription>Potential earnings from AdSense & Sponsorships</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(budgetModel.totalProjectedRevenue)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Net Budget Impact</CardTitle>
          <CardDescription>Your project's financial outlook</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <p className={`text-5xl font-extrabold ${netImpactColor} mb-4 flex items-center space-x-3`}>
            {budgetModel.netImpact >= 0 ? (
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            ) : (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
            <span>{formatCurrency(budgetModel.netImpact)}</span>
          </p>
          <Badge variant={netImpactBadge} className="text-lg px-4 py-2">
            {budgetModel.netImpact >= 0 ? "Projected Profit" : "Projected Loss"}
          </Badge>
        </CardContent>
      </Card>

      {/* Repositioned and Enhanced: Next Steps & Recommendations Card */}
      <Card className="mb-8 border-l-4 border-blue-500 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/30">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
            <Lightbulb className="mr-2 h-5 w-5 text-blue-500" />
            Next Steps & Recommendations
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-400">Guidance based on your project's financial outlook.</CardDescription>
        </CardHeader>
        <CardContent>
          {budgetModel.netImpact >= 0 ? (
            <div className="text-green-700 dark:text-green-300">
              <p className="font-semibold mb-2">Congratulations! Your project is projected to be profitable.</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Consider refining your accepted commercial opportunities for maximum impact.</li>
                <li>Explore additional creative integrations to further boost potential revenue.</li>
                <li>Proceed with confidence, knowing your project has strong financial viability.</li>
              </ul>
            </div>
          ) : (
            <div className="text-red-700 dark:text-red-300">
              <p className="font-semibold mb-2">Your project is currently projected for a loss.</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Review your script again for more potential commercial opportunities.</li>
                <li>Adjust your "Creative Flexibility" in the input form to allow for more integrations.</li>
                <li>Re-evaluate your target production budget to align with projected revenue.</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>Detailed view of potential income streams</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">Baseline AdSense Revenue:</span>
            <span className="font-medium">{formatCurrency(budgetModel.baselineAdsenseRevenue)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">Potential Sponsorship Revenue:</span>
            <span className="font-medium">{formatCurrency(budgetModel.potentialSponsorshipRevenue)}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Total Projected Revenue:</span>
            <span>{formatCurrency(budgetModel.totalProjectedRevenue)}</span>
          </div>
        </CardContent>
        </Card>

      {budgetModel.categoryBreakdown && Object.keys(budgetModel.categoryBreakdown).length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Sponsorship Breakdown by Category</CardTitle>
            <CardDescription>Estimated revenue from different commercial types</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(budgetModel.categoryBreakdown).map(([category, amount]) => (
              <div key={category} className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                <span>{category}:</span>
                <span className="font-medium">{formatCurrency(amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Sponsorship Category Distribution Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sponsorship Category Distribution</CardTitle>
          <CardDescription>Visual breakdown of revenue by opportunity type</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryDistributionChart categoryBreakdown={budgetModel.categoryBreakdown} />
        </CardContent>
      </Card>

      {/* Commercial Queries Summary Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
            Commercial Opportunities Summary
          </CardTitle>
          <CardDescription>Overview of detected and reviewed opportunities</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-3 border rounded-md bg-gray-50 dark:bg-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">Total Detected</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalQueries}</p>
          </div>
          <div className="p-3 border rounded-md bg-green-50 dark:bg-green-900/30">
            <p className="text-sm text-green-700 dark:text-green-300">Accepted</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{acceptedQueries}</p>
          </div>
          <div className="p-3 border rounded-md bg-red-50 dark:bg-red-900/30">
            <p className="text-sm text-red-700 dark:text-red-300">Rejected</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{rejectedQueries}</p>
          </div>
        </CardContent>
      </Card>

      {/* Commercial Query Type Distribution Chart (now here) */}
      <CommercialQueryTypeChart commercialQueries={commercialQueries} />

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Financial Comparison</CardTitle>
          <CardDescription>Visualizing budget vs. projected revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <RevenueChart budgetModel={budgetModel} />
        </CardContent>
      </Card>

      {/* Brand Safety Score & Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <ShieldCheck className="mr-2 h-5 w-5 text-blue-500" />
                    Brand Safety Score
                </CardTitle>
                <CardDescription>AI assessment of content suitability for advertisers</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
                 <div className="relative flex items-center justify-center w-32 h-32">
                    <svg className="transform -rotate-90 w-32 h-32">
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={351.86}
                            strokeDashoffset={351.86 - (351.86 * (budgetModel.brandSafetyScore || 0)) / 100}
                            className={`${(budgetModel.brandSafetyScore || 0) >= 80 ? 'text-green-500' : (budgetModel.brandSafetyScore || 0) >= 60 ? 'text-yellow-500' : 'text-red-500'}`}
                        />
                    </svg>
                    <span className="absolute text-3xl font-bold text-gray-700 dark:text-white">{budgetModel.brandSafetyScore || 0}</span>
                 </div>
                 <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                    {(budgetModel.brandSafetyScore || 0) >= 80 ? "Excellent! Highly safe for all brands." : (budgetModel.brandSafetyScore || 0) >= 60 ? "Good. Generally safe but review specific contexts." : "Caution. Content may limit advertiser pool."}
                 </p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
                    Monetization Tips
                </CardTitle>
                <CardDescription>AI-generated suggestions to boost revenue</CardDescription>
            </CardHeader>
            <CardContent>
                {budgetModel.monetizationTips && budgetModel.monetizationTips.length > 0 ? (
                    <ul className="space-y-3">
                        {budgetModel.monetizationTips.map((tip, index) => (
                            <li key={index} className="flex items-start">
                                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{tip}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500 italic">No specific tips available for this analysis.</p>
                )}
            </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-8 space-x-4">
        <Button variant="outline" onClick={handleDownloadReport} disabled={isDownloadingPDF}>
          {isDownloadingPDF ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download PDF Report
            </>
          )}
        </Button>
        <Button variant="outline" onClick={handleDownloadCSV} disabled={isDownloadingCSV}>
          {isDownloadingCSV ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Downloading CSV...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download Queries CSV
            </>
          )}
        </Button>
        <Button variant="secondary" onClick={onReviewScript}>
          Review Script
        </Button>
        <Button onClick={onReset}>
          Start New Analysis
        </Button>
      </div>

      {/* Hidden component for PDF generation */}
      <div id="report-content" style={{ display: 'none' }}>
        <ReportContent
          script={script}
          budgetModel={budgetModel}
          commercialQueries={commercialQueries}
        />
      </div>
    </div>
  );
};

export default BudgetImpactDashboard;