export interface LLMProvider {
  // Identification
  id: string;
  slug: string;
  name: string;
  provider: "google" | "openai" | "anthropic" | "perplexity";

  // Model details
  model: string;
  version?: string;

  // Configuration
  maxOutputTokens: number;
  temperature: number;

  // Status
  isEnabled: boolean;
  requiresApiKey: boolean;

  // Metadata
  displayName: string;
  description: string;
  category: "free" | "paid" | "enterprise";
  costPerToken?: number;

  // Rate limits
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay?: number;
  };

  // Features
  features: {
    supportsStreaming: boolean;
    supportsCitations: boolean;
    supportsWebSearch: boolean;
  };
}

export const LLM_PROVIDERS: LLMProvider[] = [
  // Google Gemini Models
  {
    id: "gemini-flash-lite",
    slug: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    provider: "google",
    model: "gemini-2.5-flash-lite",
    version: "2.5",
    maxOutputTokens: 8192,
    temperature: 0.7,
    isEnabled: true,
    requiresApiKey: true,
    displayName: "Gemini Flash Lite",
    description: "Fast, efficient model for quick responses",
    category: "free",
    rateLimit: {
      requestsPerMinute: 15,
      requestsPerDay: 1500,
    },
    features: {
      supportsStreaming: true,
      supportsCitations: false,
      supportsWebSearch: true,
    },
  },
  {
    id: "gemini-flash",
    slug: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "google",
    model: "gemini-1.5-flash",
    version: "1.5",
    maxOutputTokens: 8192,
    temperature: 0.7,
    isEnabled: false,
    requiresApiKey: true,
    displayName: "Gemini Flash",
    description: "Balanced speed and quality",
    category: "free",
    rateLimit: {
      requestsPerMinute: 15,
      requestsPerDay: 1500,
    },
    features: {
      supportsStreaming: true,
      supportsCitations: false,
      supportsWebSearch: true,
    },
  },
  {
    id: "gemini-pro",
    slug: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "google",
    model: "gemini-1.5-pro",
    version: "1.5",
    maxOutputTokens: 8192,
    temperature: 0.7,
    isEnabled: false,
    requiresApiKey: true,
    displayName: "Gemini Pro",
    description: "Best quality responses, slower",
    category: "free",
    costPerToken: 0.000125,
    rateLimit: {
      requestsPerMinute: 10,
      requestsPerDay: 1000,
    },
    features: {
      supportsStreaming: true,
      supportsCitations: false,
      supportsWebSearch: true,
    },
  },

  // OpenAI Models
  {
    id: "gpt-4-turbo",
    slug: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "openai",
    model: "gpt-4-turbo",
    maxOutputTokens: 4096,
    temperature: 0.7,
    isEnabled: false, // Disabled by default (requires paid API)
    requiresApiKey: true,
    displayName: "GPT-4 Turbo",
    description: "Most capable OpenAI model",
    category: "paid",
    costPerToken: 0.00003,
    rateLimit: {
      requestsPerMinute: 10,
      requestsPerDay: 500,
    },
    features: {
      supportsStreaming: true,
      supportsCitations: false,
      supportsWebSearch: false,
    },
  },
  {
    id: "gpt-4o",
    slug: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    model: "gpt-4o",
    maxOutputTokens: 4096,
    temperature: 0.7,
    isEnabled: false,
    requiresApiKey: true,
    displayName: "GPT-4o",
    description: "Optimized GPT-4 for speed",
    category: "paid",
    costPerToken: 0.000015,
    rateLimit: {
      requestsPerMinute: 10,
      requestsPerDay: 500,
    },
    features: {
      supportsStreaming: true,
      supportsCitations: false,
      supportsWebSearch: false,
    },
  },
  {
    id: "gpt-3.5-turbo",
    slug: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "openai",
    model: "gpt-3.5-turbo",
    maxOutputTokens: 4096,
    temperature: 0.7,
    isEnabled: false,
    requiresApiKey: true,
    displayName: "GPT-3.5 Turbo",
    description: "Fast and affordable",
    category: "paid",
    costPerToken: 0.0000015,
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerDay: 10000,
    },
    features: {
      supportsStreaming: true,
      supportsCitations: false,
      supportsWebSearch: false,
    },
  },

  // Anthropic Claude Models
  {
    id: "claude-3.5-sonnet",
    slug: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    version: "3.5",
    maxOutputTokens: 8192,
    temperature: 0.7,
    isEnabled: false,
    requiresApiKey: true,
    displayName: "Claude 3.5 Sonnet",
    description: "Balanced intelligence and speed",
    category: "paid",
    costPerToken: 0.000015,
    rateLimit: {
      requestsPerMinute: 5,
      requestsPerDay: 1000,
    },
    features: {
      supportsStreaming: true,
      supportsCitations: false,
      supportsWebSearch: false,
    },
  },
  {
    id: "claude-3-opus",
    slug: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    provider: "anthropic",
    model: "claude-3-opus-20240229",
    version: "3",
    maxOutputTokens: 4096,
    temperature: 0.7,
    isEnabled: false,
    requiresApiKey: true,
    displayName: "Claude 3 Opus",
    description: "Most capable Claude model",
    category: "paid",
    costPerToken: 0.000075,
    rateLimit: {
      requestsPerMinute: 5,
      requestsPerDay: 500,
    },
    features: {
      supportsStreaming: true,
      supportsCitations: false,
      supportsWebSearch: false,
    },
  },

  // Perplexity Models
  {
    id: "perplexity-sonar",
    slug: "sonar",
    name: "Perplexity Sonar",
    provider: "perplexity",
    model: "sonar",
    maxOutputTokens: 4096,
    temperature: 0.7,
    isEnabled: false,
    requiresApiKey: true,
    displayName: "Perplexity Sonar",
    description: "Real-time web search integration",
    category: "paid",
    costPerToken: 0.000001,
    rateLimit: {
      requestsPerMinute: 20,
      requestsPerDay: 5000,
    },
    features: {
      supportsStreaming: true,
      supportsCitations: true, // Perplexity has native citations
      supportsWebSearch: true, // Built-in web search
    },
  },
];

// Helper functions
export const getEnabledProviders = (): LLMProvider[] => {
  return LLM_PROVIDERS.filter((p) => p.isEnabled);
};

export const getProviderById = (id: string): LLMProvider | undefined => {
  return LLM_PROVIDERS.find((p) => p.id === id);
};

export const getProvidersByCategory = (
  category: "free" | "paid" | "enterprise",
): LLMProvider[] => {
  return LLM_PROVIDERS.filter((p) => p.category === category);
};

export const getProvidersByProviderType = (
  provider: "google" | "openai" | "anthropic" | "perplexity",
): LLMProvider[] => {
  return LLM_PROVIDERS.filter((p) => p.provider === provider);
};
