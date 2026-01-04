/**
 * Generate diverse, high-quality prompts for a given category
 * Improved version with more variety and better coverage
 */

interface PromptTemplate {
  text: string;
  type: "recommendation" | "comparison" | "feature" | "price" | "use_case";
}

// Category-specific keywords for better context
const categoryKeywords: Record<string, string[]> = {
  "CRM Software": ["sales", "customer relationships", "pipeline", "contacts"],
  "Project Management": ["tasks", "teams", "collaboration", "workflows"],
  "Marketing Automation": ["campaigns", "email", "leads", "analytics"],
  "Customer Support": ["tickets", "help desk", "support", "chat"],
  "Analytics Tools": ["data", "insights", "reporting", "dashboards"],
  "Communication Tools": ["chat", "video", "messaging", "collaboration"],
  "Design Tools": ["graphics", "UI", "prototyping", "creative"],
  "Development Tools": ["coding", "deployment", "CI/CD", "version control"],
};

// Expanded prompt templates with more variety
const promptTemplatesByType = {
  recommendation: [
    "What is the best {category} for small businesses?",
    "What is the best {category} for startups?",
    "What is the best {category} for enterprise companies?",
    "Top {category} for remote teams",
    "What {category} do experts recommend?",
    "Most popular {category} in 2025",
    "Best {category} for beginners",
    "Leading {category} platforms",
    "Recommended {category} for growing teams",
    "What {category} should I use for {keyword}?",
  ],
  comparison: [
    "Compare the top {category} options",
    "{category}: which is better for small business vs enterprise?",
    "Compare {category} features and pricing",
    "Differences between popular {category}",
    "Best {category} comparison",
    "Side-by-side {category} comparison",
    "{category} pros and cons",
    "Compare affordable {category} tools",
    "Enterprise vs SMB {category} comparison",
    "Which {category} is better for {keyword}?",
  ],
  feature: [
    "Which {category} has the best features?",
    "{category} with best {keyword} capabilities",
    "Most feature-rich {category}",
    "{category} with advanced automation",
    "Best {category} for integrations",
    "{category} with mobile apps",
    "Most customizable {category}",
    "{category} with AI features",
    "Feature comparison of {category}",
    "Which {category} has the best {keyword}?",
  ],
  price: [
    "Most affordable {category}",
    "Free {category} alternatives",
    "Best value {category} tools",
    "{category} pricing comparison",
    "Cheap {category} options",
    "Budget-friendly {category}",
    "Free vs paid {category}",
    "Best ROI {category}",
    "Cost-effective {category} for startups",
    "What is the cheapest {category}?",
  ],
  use_case: [
    "Best {category} for remote teams",
    "{category} for {keyword} workflows",
    "Best {category} for freelancers",
    "{category} for agencies",
    "Best {category} for SaaS companies",
    "{category} for e-commerce",
    "Industry-specific {category}",
    "{category} for developers",
    "Best {category} for marketing teams",
    "What {category} works best for {keyword}?",
  ],
};

/**
 * Get random keyword for the category
 */
const getCategoryKeyword = (category: string): string => {
  const keywords = categoryKeywords[category] || [
    "teams",
    "businesses",
    "projects",
  ];
  return keywords[Math.floor(Math.random() * keywords.length)] || "teams";
};

/**
 * Generate a prompt from template with replacements
 */
const generateFromTemplate = (
  template: string,
  category: string,
  productName: string,
): string => {
  const keyword = getCategoryKeyword(category);
  return template
    .replace(/{category}/g, category.toLowerCase())
    .replace(/{keyword}/g, keyword)
    .replace(/{productName}/g, productName);
};

/**
 * Generate prompts with improved variety and coverage
 */
export const generatePrompts = (
  category: string,
  productName: string,
  count: number,
): PromptTemplate[] => {
  const prompts: PromptTemplate[] = [];

  // Calculate how many prompts per type (balanced distribution)
  const types: Array<
    "recommendation" | "comparison" | "feature" | "price" | "use_case"
  > = ["recommendation", "comparison", "feature", "price", "use_case"];

  const promptsPerType = Math.floor(count / types.length);
  const remainder = count % types.length;

  // Generate prompts for each type
  types.forEach((type, typeIndex) => {
    const templates = promptTemplatesByType[type];
    const countForType = promptsPerType + (typeIndex < remainder ? 1 : 0);

    // Shuffle templates to get variety
    const shuffledTemplates = [...templates].sort(() => Math.random() - 0.5);

    for (let i = 0; i < countForType && i < shuffledTemplates.length; i++) {
      const template = shuffledTemplates[i];
      if (template) {
        prompts.push({
          text: generateFromTemplate(template, category, productName),
          type,
        });
      }
    }
  });

  // Shuffle final list to mix up the order
  return prompts.sort(() => Math.random() - 0.5);
};
