"use client";

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SavedScriptAnalysis } from "@/types"; // Import SavedScriptAnalysis type
import { Button } from "@/components/ui/button";
import { PlusCircle, List, FileText } from "lucide-react"; // Import new icons

interface RightSidebarProps {
  allScripts: SavedScriptAnalysis[]; // Receive allScripts as a prop
  refreshScripts: () => void; // Receive refresh function
}

const RightSidebar: React.FC<RightSidebarProps> = ({ allScripts, refreshScripts }) => {
  const [recentActivity, setRecentActivity] = useState<SavedScriptAnalysis[]>([]);

  useEffect(() => {
    if (!allScripts || !Array.isArray(allScripts)) {
      setRecentActivity([]);
      return;
    }
    // Sort by savedAt descending (newest first) and take top 5
    const sortedScripts = [...allScripts] // Create a copy to sort
      .sort((a, b) => {
        const dateA = a.savedAt ? new Date(a.savedAt).getTime() : 0;
        const dateB = b.savedAt ? new Date(b.savedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
    setRecentActivity(sortedScripts);
  }, [allScripts]); // Re-run when allScripts changes

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="hidden md:block md:w-64 lg:w-72 flex-shrink-0 p-4 space-y-4"> {/* Added space-y-4 for spacing between cards */}
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Recent Analyses</CardTitle>
          <CardDescription>Your most recent script insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 italic">No recent activity. Start a new analysis!</p>
          ) : (
            <>
              {recentActivity.map((analysis) => {
                // Defensive check for required data structure
                if (!analysis?.script?.id || !analysis?.budgetModel) {
                  return null;
                }
                
                const netImpact = analysis.budgetModel.netImpact ?? 0;
                const isPositive = netImpact >= 0;
                const title = analysis.script.title || "Untitled Script";
                const dateString = analysis.savedAt ? new Date(analysis.savedAt).toLocaleDateString() : "Unknown Date";

                return (
                <div key={analysis.script.id} className="border-b pb-2 last:border-0 last:pb-0">
                  <Link
                    to={`/scripts/${analysis.script.id}`} // Link to new ScriptDetailPage
                    className="font-medium hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer block truncate"
                    title={title}
                  >
                    {title}
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Analyzed on {dateString}
                  </p>
                  <p className={`text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    Net Impact: {formatCurrency(netImpact)}
                  </p>
                </div>
                );
              })}
              <div className="pt-2">
                <Link to="/my-scripts">
                  <Button variant="link" className="p-0 h-auto">View All My Scripts</Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* New Quick Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Jump to key features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link to="/dashboard" className="block">
            <Button className="w-full flex items-center justify-center space-x-2">
              <PlusCircle className="h-4 w-4" />
              <span>Start New Analysis</span>
            </Button>
          </Link>
          <Link to="/my-scripts" className="block">
            <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
              <List className="h-4 w-4" />
              <span>View All Scripts ({allScripts.length})</span> {/* Display total count */}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default RightSidebar;