export interface AnalysisConfig {
  prompts: {
    min: number;
    max: number;
    default: number;
  };
  providers: {
    minRequired: number;
    maxAllowed: number;
  };
  brands: {
    min: number;
    max: number;
  };
  rateLimit: {
    delayBetweenRequests: number; // milliseconds
  };
}

export const ANALYSIS_CONFIG: AnalysisConfig = {
  prompts: {
    min: 5,
    max: 50,
    default: 10,
  },
  providers: {
    minRequired: 1,
    maxAllowed: 10,
  },
  brands: {
    min: 2,
    max: 10,
  },
  rateLimit: {
    delayBetweenRequests: 2000, // 2 seconds
  },
};
