"use client";

import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Globe, ArrowRight } from "lucide-react";
import { useState } from "react";

export const HeroSearchTab: React.FC = () => {
  const [showConfigsTab, setShowConfigsTab] = useState(false);

  return (
    <div className="bg-background w-[700px] rounded-lg border">
      <div className="flex items-center gap-2 border-b p-3">
        <Globe className="text-muted-foreground mt-1 w-4" />
        <input
          type="text"
          className="mt-0.5 w-full border-none outline-none"
          placeholder="https://example.com"
        />
      </div>

      <div
        className={`w-full ${showConfigsTab ? "max-h-500" : "max-h-0"} overflow-hidden duration-300 ease-in-out`}
      >
        <div className="border-b p-3"></div>
      </div>

      <div className="flex justify-between p-3">
        <Tabs defaultValue="api_only">
          <TabsList>
            <TabsTrigger value="api_only">API Search Only</TabsTrigger>
            <TabsTrigger value="crawling_only" disabled>
              Web Crawling Only
            </TabsTrigger>
            <TabsTrigger value="both" disabled>
              Both
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          variant="outline"
          onClick={() => {
            setShowConfigsTab(!showConfigsTab);
          }}
        >
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
};
