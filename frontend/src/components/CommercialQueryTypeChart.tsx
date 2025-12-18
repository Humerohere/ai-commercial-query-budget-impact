"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CommercialQuery } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CommercialQueryTypeChartProps {
  commercialQueries: CommercialQuery[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']; // Consistent colors

const CommercialQueryTypeChart: React.FC<CommercialQueryTypeChartProps> = ({ commercialQueries }) => {
  // Aggregate data by query type
  const dataMap = commercialQueries.reduce((acc, query) => {
    if (query.status === 'accepted') { // Only count accepted queries for this chart
      acc[query.type] = (acc[query.type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(dataMap).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1), // Capitalize type for display
    count: count,
  }));

  if (chartData.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Commercial Query Type Distribution</CardTitle>
          <CardDescription>Breakdown of accepted commercial opportunities by type.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
          No accepted commercial queries to display.
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg text-sm">
          <p className="font-semibold mb-1">{label}</p>
          <p>Count: <span className="font-medium">{payload[0].value}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Commercial Query Type Distribution</CardTitle>
        <CardDescription>Breakdown of accepted commercial opportunities by type.</CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
            <YAxis allowDecimals={false} stroke="hsl(var(--foreground))" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill={COLORS[0]} /> {/* Using a single color for simplicity, or cycle through COLORS */}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CommercialQueryTypeChart;