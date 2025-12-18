"use client";

import React, { useState } from "react";
import { CommercialQuery } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import HighlightedScript from "./HighlightedScript";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components
import { Info } from "lucide-react"; // Import an icon for the alert

interface CommercialQueryDisplayProps {
  scriptText: string;
  commercialQueries: CommercialQuery[];
  onReviewComplete: (updatedQueries: CommercialQuery[]) => void;
  onBack: () => void;
}

const CommercialQueryDisplay: React.FC<CommercialQueryDisplayProps> = ({
  scriptText,
  commercialQueries,
  onReviewComplete,
  onBack,
}) => {
  const [localQueries, setLocalQueries] = useState<CommercialQuery[]>(commercialQueries);

  const handleToggle = (id: string, checked: boolean) => {
    setLocalQueries((prevQueries) =>
      prevQueries.map((query) =>
        query.id === id ? { ...query, status: checked ? 'accepted' : 'rejected' } : query
      )
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Review Commercial Opportunities</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Toggle to accept or reject each potential commercial query. Accepted queries will be included in the budget impact analysis.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Script Content</CardTitle>
            <CardDescription>Detected opportunities highlighted in context</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] p-4 border rounded-md bg-gray-50 dark:bg-gray-700">
              <HighlightedScript
                scriptText={scriptText}
                commercialQueries={localQueries}
                onToggleQueryStatus={handleToggle} // Pass the toggle function
              />
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Detected Queries</CardTitle>
            <CardDescription>Accept or reject each opportunity</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {localQueries.length === 0 ? (
                  <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200">
                    <Info className="h-4 w-4" />
                    <AlertTitle>No Commercial Queries Detected</AlertTitle>
                    <AlertDescription>
                      The AI did not find any commercial opportunities in your script based on the current parameters.
                      Consider adjusting your "Creative Flexibility" or adding more descriptive content to your script.
                    </AlertDescription>
                  </Alert>
                ) : (
                  localQueries.map((query) => (
                    <div key={query.id} className="flex items-center justify-between p-3 border rounded-md bg-gray-50 dark:bg-gray-700">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">{query.term}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">{query.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{query.reason}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Est. Revenue: {formatCurrency(query.estimatedRevenue)} | Confidence: {query.confidenceScore}%
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`query-toggle-${query.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                          {query.status === 'accepted' ? 'Accepted' : 'Rejected'}
                        </Label>
                        <Switch
                          id={`query-toggle-${query.id}`}
                          checked={query.status === 'accepted'}
                          onCheckedChange={(checked) => handleToggle(query.id, checked)}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack}>
          Back to Input
        </Button>
        <Button onClick={() => onReviewComplete(localQueries)}>
          Calculate Budget Impact
        </Button>
      </div>
    </div>
  );
};

export default CommercialQueryDisplay;