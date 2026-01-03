/**
 * Generate template-based prompts for a given category
 * POC uses simple templates, MVP will add AI-generated prompts
 */

interface PromptTemplate {
  text: string;
  type: "recommendation" | "comparison" | "feature" | "price" | "use_case";
}

export const generatePrompts = (
  category: string,
  productName: string,
  count: number = 5,
): PromptTemplate[] => {
  const templates: PromptTemplate[] = [
    {
      text: `What's the best ${category.toLowerCase()} for small businesses?`,
      type: "recommendation",
    },
    {
      text: `Compare the top ${category.toLowerCase()} options`,
      type: "comparison",
    },
    {
      text: `Which ${category.toLowerCase()} has the best features?`,
      type: "feature",
    },
    {
      text: `Most affordable ${category.toLowerCase()} tools`,
      type: "price",
    },
    {
      text: `Best ${category.toLowerCase()} for remote teams`,
      type: "use_case",
    },
    {
      text: `${category} with best integrations`,
      type: "feature",
    },
    {
      text: `Top 5 ${category.toLowerCase()} platforms`,
      type: "recommendation",
    },
    {
      text: `${category} for startups vs enterprise`,
      type: "comparison",
    },
    {
      text: `Free ${category.toLowerCase()} alternatives`,
      type: "price",
    },
    {
      text: `${category} with mobile apps`,
      type: "feature",
    },
  ];

  // Shuffle and return requested count
  const shuffled = templates.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
