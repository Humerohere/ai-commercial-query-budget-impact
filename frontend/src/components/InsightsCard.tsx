"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb, DollarSign, TrendingUp } from "lucide-react";

const InsightsCard: React.FC = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Why Analyze Your Script?</CardTitle>
        <CardDescription>Unlock your content's full potential.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex items-start space-x-3">
          <Lightbulb className="h-5 w-5 text-blue-500 flex-shrink-0" />
          <div>
            <h4 className="font-medium">De-risk Production</h4>
            <p className="text-xs">Understand potential sponsorship revenue before investing heavily.</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <DollarSign className="h-5 w-5 text-green-500 flex-shrink-0" />
          <div>
            <h4 className="font-medium">Maximize Monetization</h4>
            <p className="text-xs">Identify natural commercial opportunities within your narrative.</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <TrendingUp className="h-5 w-5 text-purple-500 flex-shrink-0" />
          <div>
            <h4 className="font-medium">Strategic Planning</h4>
            <p className="text-xs">Make informed decisions about project viability and creative adaptations.</p>
          </div>
        </div>
        <p className="text-xs italic text-gray-500 dark:text-gray-400 pt-2">
          Our AI helps you find the perfect balance between creative vision and financial success.
        </p>
      </CardContent>
    </Card>
  );
};

export default InsightsCard;