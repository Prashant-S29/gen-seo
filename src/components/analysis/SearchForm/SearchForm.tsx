"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Check } from "lucide-react";

import { api } from "~/trpc/react";
import { searchFormSchema, type SearchFormInput } from "~/zodSchema/analysis";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { LLM_PROVIDERS, ANALYSIS_CONFIG } from "~/lib/constants";
import { cn } from "~/lib/utils";

const CATEGORIES = [
  "CRM Software",
  "Project Management",
  "Marketing Automation",
  "Customer Support",
  "Analytics Tools",
  "Communication Tools",
  "Design Tools",
  "Development Tools",
];

export const SearchForm: React.FC = () => {
  const router = useRouter();
  const [competitors, setCompetitors] = useState<string[]>(["", ""]);

  // Get only enabled providers
  const enabledProviders = LLM_PROVIDERS.filter((p) => p.isEnabled);

  const form = useForm<SearchFormInput>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      productName: "",
      primaryBrand: "",
      competitors: ["", ""],
      category: "",
      selectedProviders: ["gpt-4-turbo"], // Default to GPT-4 Turbo
      promptCount: 5,
    },
  });

  const createAnalysis = api.analysis.create.useMutation({
    onSuccess: (data) => {
      router.push(`/dashboard/processing/${data.sessionId}`);
    },
    onError: (error) => {
      console.error("Failed to create analysis:", error);
    },
  });

  const handleAddCompetitor = () => {
    if (competitors.length < ANALYSIS_CONFIG.brands.max) {
      const newCompetitors = [...competitors, ""];
      setCompetitors(newCompetitors);
      form.setValue("competitors", newCompetitors);
    }
  };

  const handleRemoveCompetitor = (index: number) => {
    if (competitors.length > ANALYSIS_CONFIG.brands.min) {
      const newCompetitors = competitors.filter((_, i) => i !== index);
      setCompetitors(newCompetitors);
      form.setValue("competitors", newCompetitors);
    }
  };

  const handleCompetitorChange = (index: number, value: string) => {
    const newCompetitors = [...competitors];
    newCompetitors[index] = value;
    setCompetitors(newCompetitors);
    form.setValue("competitors", newCompetitors);
  };

  const onSubmit = (data: SearchFormInput) => {
    const filteredCompetitors = data.competitors.filter((c) => c.trim() !== "");

    // Validate product name
    if (!data.productName?.trim()) {
      form.setError("productName", {
        message: "Product name is required",
      });
    }

    // Validate brand name
    if (!data.primaryBrand?.trim()) {
      form.setError("primaryBrand", {
        message: "Brand name is required",
      });
    }

    // Validate category
    if (!data.category?.trim()) {
      form.setError("category", {
        message: "Category is required",
      });
    }

    // Validate competitors
    if (filteredCompetitors.length < ANALYSIS_CONFIG.brands.min) {
      form.setError("competitors", {
        message: `Please add at least ${ANALYSIS_CONFIG.brands.min} competitor brands`,
      });
    }

    // Validate providers
    if (!data.selectedProviders || data.selectedProviders.length === 0) {
      form.setError("selectedProviders", {
        message: "Please select at least one AI provider",
      });
    }

    // Validate prompt count
    if (!data.promptCount || data.promptCount < 5 || data.promptCount > 50) {
      form.setError("promptCount", {
        message: "Prompts must be between 5 and 50",
      });
    }

    // If any errors, stop submission
    if (Object.keys(form.formState.errors).length > 0) {
      return;
    }

    createAnalysis.mutate({
      ...data,
      competitors: filteredCompetitors,
    });
  };

  return (
    <Card className="bg-transparent">
      <CardHeader>
        <CardTitle>Configure Your Analysis</CardTitle>
        <CardDescription>
          Set up your brand visibility analysis parameters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Product Name, Primary Brand, Category - Grid of 3 */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Notion" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="primaryBrand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Brand Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Notion" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* Competitors - Grid of 4 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel
                  className={cn(
                    form.formState.errors.competitors && "text-destructive",
                  )}
                >
                  Competitor Brands (min {ANALYSIS_CONFIG.brands.min}, max{" "}
                  {ANALYSIS_CONFIG.brands.max})
                </FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCompetitor}
                  disabled={competitors.length >= ANALYSIS_CONFIG.brands.max}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Competitor
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                {competitors.map((competitor, index) => (
                  <div key={index} className="relative">
                    <Input
                      placeholder={`Competitor ${index + 1}`}
                      value={competitor}
                      onChange={(e) =>
                        handleCompetitorChange(index, e.target.value)
                      }
                    />
                    {competitors.length > ANALYSIS_CONFIG.brands.min && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCompetitor(index)}
                        className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {form.formState.errors.competitors && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.competitors.message}
                </p>
              )}
            </div>

            {/* AI Providers Selection - Only Enabled Providers */}
            <FormField
              control={form.control}
              name="selectedProviders"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Providers</FormLabel>
                  <FormDescription>
                    Select which AI platforms to analyze (more providers = more
                    comprehensive results)
                  </FormDescription>
                  <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {enabledProviders.map((provider) => {
                      const isSelected = field.value?.includes(provider.id);

                      return (
                        <div
                          key={provider.id}
                          className={cn(
                            "relative cursor-pointer border px-4 py-3 pr-3 transition-all hover:shadow-md",
                            isSelected && "border-primary/70 shadow-lg",
                            form.formState.errors.selectedProviders &&
                              !isSelected &&
                              "border-destructive",
                          )}
                          onClick={() => {
                            const currentValue = field.value || [];
                            if (isSelected) {
                              field.onChange(
                                currentValue.filter((id) => id !== provider.id),
                              );
                            } else {
                              field.onChange([...currentValue, provider.id]);
                            }
                          }}
                        >
                          <div className="p-0">
                            <div className="flex items-start justify-between">
                              <p className="font-medium">
                                {provider.displayName}
                              </p>
                              <div
                                className={cn(
                                  "flex h-4 w-4 items-center justify-center rounded border",
                                  isSelected
                                    ? "border-primary bg-primary"
                                    : "border-muted-foreground",
                                )}
                              >
                                {isSelected && (
                                  <Check className="text-primary-foreground h-3 w-3" />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-muted-foreground text-sm">
                              {provider.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </FormItem>
              )}
            />

            {/* Number of Prompts with Number Input */}
            <FormField
              control={form.control}
              name="promptCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Number of Prompts [ config coming soon ]
                  </FormLabel>
                  <FormDescription>
                    How many search queries to test per provider (default 05)
                  </FormDescription>
                  <FormControl>
                    <div className="space-y-4">
                      <Input
                        type="number"
                        min={5}
                        max={50}
                        placeholder="Enter number of prompts"
                        disabled
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value)) {
                            field.onChange(value);
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Submit and Cancel Buttons */}
            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1"
                disabled={createAnalysis.isPending}
              >
                {createAnalysis.isPending ? "Creating..." : "Start Analysis"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </Button>
            </div>

            {createAnalysis.error && (
              <p className="text-destructive text-sm">
                {createAnalysis.error.message}
              </p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
