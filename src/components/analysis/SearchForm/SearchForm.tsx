"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";

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
} from "~/components/ui/form";

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

  const form = useForm<SearchFormInput>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      productName: "",
      primaryBrand: "",
      competitors: ["", ""],
      category: "",
    },
  });

  const createAnalysis = api.analysis.create.useMutation({
    onSuccess: (data) => {
      router.push(`dashboard/processing/${data.sessionId}`);
    },
    onError: (error) => {
      console.error("Failed to create analysis:", error);
    },
  });

  const handleAddCompetitor = () => {
    if (competitors.length < 10) {
      const newCompetitors = [...competitors, ""];
      setCompetitors(newCompetitors);
      form.setValue("competitors", newCompetitors);
    }
  };

  const handleRemoveCompetitor = (index: number) => {
    if (competitors.length > 2) {
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

    if (filteredCompetitors.length < 2) {
      form.setError("competitors", {
        message: "Please add at least 2 competitor brands",
      });
      return;
    }

    createAnalysis.mutate({
      ...data,
      competitors: filteredCompetitors,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start New Analysis</CardTitle>
        <CardDescription>
          Enter your product details and competitors to analyze AI visibility
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Name */}
            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Notion" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Primary Brand */}
            <FormField
              control={form.control}
              name="primaryBrand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Brand Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Notion" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <select
                      className="border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="">Select a category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Competitors */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Competitor Brands (min 2, max 10)</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCompetitor}
                  disabled={competitors.length >= 10}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Competitor
                </Button>
              </div>

              <div className="space-y-2">
                {competitors.map((competitor, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Competitor ${index + 1}`}
                      value={competitor}
                      onChange={(e) =>
                        handleCompetitorChange(index, e.target.value)
                      }
                    />
                    {competitors.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveCompetitor(index)}
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

            {/* Submit Button */}
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
