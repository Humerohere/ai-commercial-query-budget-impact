"use client";

import React from "react";
import { CommercialQuery } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface InteractiveHighlightProps {
  query: CommercialQuery;
  children: React.ReactNode;
  onToggleStatus: (id: string, checked: boolean) => void;
}

const InteractiveHighlight: React.FC<InteractiveHighlightProps> = ({
  query,
  children,
  onToggleStatus,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const highlightClasses = cn(
    "px-1 rounded-sm cursor-pointer",
    query.status === 'accepted' && "bg-green-200 dark:bg-green-700 text-green-900 dark:text-green-100",
    query.status === 'rejected' && "bg-red-200 dark:bg-red-700 text-red-900 dark:text-red-100 line-through",
    query.status === 'pending' && "bg-yellow-200 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100",
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className={highlightClasses}>
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="grid gap-2">
          <div className="space-y-1">
            <h4 className="font-medium leading-none flex items-center">
              {query.term}
              <Badge variant="secondary" className="ml-2 text-xs">{query.type}</Badge>
            </h4>
            <p className="text-sm text-muted-foreground">{query.reason}</p>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between text-sm">
              <span>Est. Revenue:</span>
              <span className="font-medium">{formatCurrency(query.estimatedRevenue)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Confidence:</span>
              <span className="font-medium">{query.confidenceScore}%</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <Label htmlFor={`query-toggle-${query.id}`} className="text-sm">
                {query.status === 'accepted' ? 'Accepted' : 'Rejected'}
              </Label>
              <Switch
                id={`query-toggle-${query.id}`}
                checked={query.status === 'accepted'}
                onCheckedChange={(checked) => onToggleStatus(query.id, checked)}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default InteractiveHighlight;