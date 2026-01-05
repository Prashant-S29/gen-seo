"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

interface VisibilityChartProps {
  data: Array<{
    brand: string;
    visibilityScore: number;
    mentions: number;
  }>;
  primaryBrand: string;
}

const chartConfig = {
  visibilityScore: {
    label: "Visibility Score",
    color: "hsl(var(--chart-1))",
  },
  mentions: {
    label: "Mentions",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export const VisibilityChart: React.FC<VisibilityChartProps> = ({
  data,
  primaryBrand,
}) => {
  const chartData = data.map((item) => ({
    brand: item.brand,
    visibilityScore: item.visibilityScore,
    mentions: item.mentions,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Visibility Comparison</CardTitle>
        <CardDescription>
          Visibility score and mention count across all prompts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="brand"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="visibilityScore"
              fill="var(--foreground)"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="mentions"
              fill="var(--foreground)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
