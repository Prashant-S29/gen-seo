"use client";

import React from "react";
import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

interface MentionsPieChartProps {
  data: Array<{
    brand: string;
    mentions: number;
  }>;
}

export const MentionsPieChart: React.FC<MentionsPieChartProps> = ({ data }) => {
  // Filter out brands with 0 mentions and prepare chart data
  const chartData = data
    .filter((item) => item.mentions > 0)
    .map((item, index) => ({
      brand: item.brand,
      mentions: item.mentions,
      fill: `var(--color-brand${index + 1})`,
    }));

  // Generate dynamic config based on data
  const chartConfig = chartData.reduce((config, item, index) => {
    config[`brand${index + 1}`] = {
      label: item.brand,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    };
    return config;
  }, {} as ChartConfig);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mention Distribution</CardTitle>
          <CardDescription>Share of mentions across brands</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[350px] items-center justify-center">
          <p className="text-muted-foreground">No mentions to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mention Distribution</CardTitle>
        <CardDescription>Share of mentions across brands</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto h-[350px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="mentions"
              nameKey="brand"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={({ brand, percent }) =>
                `${brand}: ${(percent * 100).toFixed(0)}%`
              }
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
