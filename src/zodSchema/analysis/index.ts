import { z } from "zod";

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
    .min(2, "Please add at least 2 competitor brands")
    .max(10, "Maximum 10 competitors allowed"),

  category: z.string().min(1, "Please select a category"),
});

export type SearchFormInput = z.infer<typeof searchFormSchema>;
