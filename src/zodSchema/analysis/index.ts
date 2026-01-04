import { z } from "zod";
import { ANALYSIS_CONFIG } from "~/lib/constants";

export const searchFormSchema = z.object({
  productName: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(255, "Product name is too long"),

  primaryBrand: z
    .string()
    .min(2, "Primary brand must be at least 2 characters")
    .max(255, "Primary brand is too long"),

  competitors: z
    .array(z.string().min(1))
    .min(
      ANALYSIS_CONFIG.brands.min,
      `Please add at least ${ANALYSIS_CONFIG.brands.min} competitor brands`,
    )
    .max(
      ANALYSIS_CONFIG.brands.max,
      `Maximum ${ANALYSIS_CONFIG.brands.max} competitors allowed`,
    ),

  category: z.string().min(1, "Please select a category"),

  selectedProviders: z
    .array(z.string())
    .min(
      ANALYSIS_CONFIG.providers.minRequired,
      `Select at least ${ANALYSIS_CONFIG.providers.minRequired} provider`,
    )
    .max(
      ANALYSIS_CONFIG.providers.maxAllowed,
      `Maximum ${ANALYSIS_CONFIG.providers.maxAllowed} providers allowed`,
    ),

  promptCount: z
    .number()
    .int()
    .min(
      ANALYSIS_CONFIG.prompts.min,
      `Minimum ${ANALYSIS_CONFIG.prompts.min} prompts`,
    )
    .max(
      ANALYSIS_CONFIG.prompts.max,
      `Maximum ${ANALYSIS_CONFIG.prompts.max} prompts`,
    ),
});

export type SearchFormInput = z.infer<typeof searchFormSchema>;
