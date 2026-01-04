import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Export analysis results to CSV
export function exportToCSV(data: {
  session: {
    productName: string;
    category: string;
    primaryBrand: string;
  };
  metrics: {
    visibilityScore: number;
    citationRate: number;
    totalPrompts: number;
    totalMentions: number;
  };
  leaderboard: Array<{
    brand: string;
    mentions: number;
    citations: number;
    visibilityScore: number;
    citationRate: number;
  }>;
  prompts: Array<{
    text: string;
    type: string | null;
    primaryBrandMentioned: boolean;
    competitorsMentioned: string[];
  }>;
}) {
  // Prepare CSV content
  const csvRows: string[] = [];

  // Header
  csvRows.push("Gen-SEO Analysis Report");
  csvRows.push(`Product: ${data.session.productName}`);
  csvRows.push(`Category: ${data.session.category}`);
  csvRows.push(`Primary Brand: ${data.session.primaryBrand}`);
  csvRows.push("");

  // Overall Metrics
  csvRows.push("Overall Metrics");
  csvRows.push("Metric,Value");
  csvRows.push(`Visibility Score,${data.metrics.visibilityScore}%`);
  csvRows.push(`Citation Rate,${data.metrics.citationRate}%`);
  csvRows.push(`Total Prompts,${data.metrics.totalPrompts}`);
  csvRows.push(`Total Mentions,${data.metrics.totalMentions}`);
  csvRows.push("");

  // Leaderboard
  csvRows.push("Brand Leaderboard");
  csvRows.push("Rank,Brand,Mentions,Citations,Visibility Score,Citation Rate");
  data.leaderboard.forEach((entry, index) => {
    csvRows.push(
      `${index + 1},${entry.brand},${entry.mentions},${entry.citations},${entry.visibilityScore}%,${entry.citationRate}%`,
    );
  });
  csvRows.push("");

  // Prompts Analysis
  csvRows.push("Prompts Analysis");
  csvRows.push("Prompt,Type,Your Brand Mentioned,Competitors Mentioned");
  data.prompts.forEach((prompt) => {
    const competitors = prompt.competitorsMentioned.join("; ");
    csvRows.push(
      `"${prompt.text}",${prompt.type || "N/A"},${prompt.primaryBrandMentioned ? "Yes" : "No"},"${competitors}"`,
    );
  });

  // Create CSV string
  const csvContent = csvRows.join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `gen-seo-analysis-${data.session.productName.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`,
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
