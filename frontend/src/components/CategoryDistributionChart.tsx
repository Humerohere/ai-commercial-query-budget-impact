"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BudgetModel } from "@/types";

interface CategoryDistributionChartProps {
  categoryBreakdown?: { [key: string]: number };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6666', '#66CCFF'];

const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({ categoryBreakdown }) => {
  if (!categoryBreakdown || Object.keys(categoryBreakdown).length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        No accepted commercial queries to display category breakdown.
      </div>
    );
  }

  const data = Object.entries(categoryBreakdown).map(([name, value]) => ({
    name,
    value,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const dataEntry = payload[0].payload;
      return (
        <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg text-sm">
          <p className="font-semibold mb-1">{dataEntry.name}</p>
          <p>Value: <span className="font-medium">{formatCurrency(dataEntry.value)}</span></p>
          <p>Percentage: <span className="font-medium">{(payload[0].percent * 100).toFixed(1)}%</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryDistributionChart;