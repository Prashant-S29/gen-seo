// src/components/analysis-flow/mock-data.ts
export const mockAnalysisData = {
  step1: {
    input: {
      url: "https://salesforce.com",
      productName: "Salesforce",
    },
  },
  step2: {
    productInfo: {
      name: "Doogle",
      description: "AI-powered CRM platform for modern sales teams",
      category: "Customer Relationship Management",
      subCategories: ["Sales Automation", "CRM", "AI Tools"],
      tags: ["crm", "sales", "ai", "automation", "customer-management"],
    },
  },
  step3: {
    competitors: [
      "HubSpot",
      "Pipedrive",
      "Zoho CRM",
      "Freshsales",
      "Close",
      "Copper",
    ],
  },
  step4: {
    prompts: [
      "What's the best CRM for small businesses?",
      "AI-powered CRM tools comparison",
      "Best sales automation software 2026",
      "Top customer management platforms",
      "Best CRM for startups with AI features",
      "Compare HubSpot vs Pipedrive vs Doogle",
      "What CRM do tech companies use?",
      "Best CRM with automation capabilities",
      "Affordable CRM solutions for sales teams",
    ],
  },
  step5: {
    apiAnalysis: {
      platforms: ["OpenAI", "Claude", "Gemini", "Perplexity"],
      totalQueries: 40,
      completed: 40,
      avgResponseTime: "2.3s",
    },
    crawlingAnalysis: {
      platforms: ["ChatGPT UI", "Claude UI"],
      totalQueries: 20,
      completed: 20,
      avgResponseTime: "18.5s",
    },
  },
  step6: {
    mentions: {
      byBrand: {
        Doogle: 12,
        HubSpot: 28,
        Pipedrive: 18,
        "Zoho CRM": 15,
        Freshsales: 9,
        Close: 7,
        Copper: 5,
      },
      byPlatform: {
        OpenAI: { Doogle: 4, total: 40 },
        Claude: { Doogle: 3, total: 40 },
        Gemini: { Doogle: 2, total: 40 },
        Perplexity: { Doogle: 3, total: 40 },
      },
    },
    citations: {
      Doogle: [
        { url: "https://doogle.ai", count: 8 },
        { url: "https://doogle.ai/features", count: 4 },
        { url: "https://doogle.ai/pricing", count: 3 },
      ],
      total: 15,
    },
    sentiment: {
      positive: 9,
      neutral: 3,
      negative: 0,
    },
  },
  step7: {
    finalMetrics: {
      visibilityScore: 23.5,
      citationShare: 8.2,
      averagePosition: 3.2,
      sentimentScore: 92,
      apiVsCrawling: {
        api: { visibility: 25.0, mentions: 12 },
        crawling: { visibility: 20.0, mentions: 8 },
        difference: 5.0,
      },
      competitiveRanking: [
        { brand: "HubSpot", score: 70.0 },
        { brand: "Pipedrive", score: 45.0 },
        { brand: "Doogle", score: 23.5 },
        { brand: "Zoho CRM", score: 37.5 },
      ],
    },
  },
};
