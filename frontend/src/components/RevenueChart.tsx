"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { BudgetModel } from "@/types";

interface RevenueChartProps {
  budgetModel: BudgetModel;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ budgetModel }) => {
  const data = [
    {
      name: "Financial Overview",
      "Baseline AdSense Revenue": budgetModel.baselineAdsenseRevenue,
      "Potential Sponsorship Revenue": budgetModel.potentialSponsorshipRevenue,
      // Production Budget is now exclusively a ReferenceLine for clarity
    },
  ];

  const formatCurrencyAxis = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg text-sm">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: <span className="font-medium">{formatCurrencyAxis(entry.value)}</span>
            </p>
          ))}
          <p className="mt-2 font-bold">Total Projected: <span className="text-blue-600 dark:text-blue-400">{formatCurrencyAxis(budgetModel.totalProjectedRevenue)}</span></p>
          <p className="font-bold">Production Budget: <span className="text-red-600 dark:text-red-400">{formatCurrencyAxis(budgetModel.productionBudget)}</span></p>
          <p className={`font-bold ${budgetModel.netImpact >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            Net Impact: {formatCurrencyAxis(budgetModel.netImpact)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" tickFormatter={formatCurrencyAxis} stroke="hsl(var(--foreground))" />
          <YAxis type="category" dataKey="name" stroke="hsl(var(--foreground))" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {/* ReferenceLine for Production Budget */}
          <ReferenceLine
            x={budgetModel.productionBudget}
            stroke="hsl(var(--destructive))"
            strokeDasharray="3 3"
            label={{ value: "Budget", position: "top", fill: "hsl(var(--destructive))" }}
          />
          {/* Stacked bars for revenue components */}
          <Bar dataKey="Baseline AdSense Revenue" stackId="a" fill="hsl(var(--secondary))" />
          <Bar dataKey="Potential Sponsorship Revenue" stackId="a" fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;