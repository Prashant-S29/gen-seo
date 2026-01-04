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

interface CitationRateChartProps {
  data: Array<{
    brand: string;
    citations: number;
    citationRate: number;
  }>;
}

const chartConfig = {
  citationRate: {
    label: "Citation Rate (%)",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export const CitationRateChart: React.FC<CitationRateChartProps> = ({
  data,
}) => {
  const chartData = data.map((item) => ({
    brand: item.brand,
    citationRate: item.citationRate,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Citation Rate by Brand</CardTitle>
        <CardDescription>
          Percentage of mentions that include citations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="brand"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="citationRate"
              fill="var(--color-citationRate)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
