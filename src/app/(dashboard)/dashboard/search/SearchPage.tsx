import React from "react";

// components
import { SearchForm } from "~/components/analysis";

export const SearchPage: React.FC = () => {
  return (
    <div className="container mx-auto max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Visibility Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Analyze how visible your brand is across AI platforms
        </p>
      </div>

      <SearchForm />
    </div>
  );
};
