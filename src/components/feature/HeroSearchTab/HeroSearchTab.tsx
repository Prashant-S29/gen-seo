"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  Loader2,
  X,
  Plus,
  Check,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/trpc/react";
import { authClient } from "~/server/better-auth/client";
import { LLM_PROVIDERS } from "~/lib/constants";
import { cn } from "~/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "url_input" | "detecting" | "configure";
type AnalysisMethod = "api_only" | "crawling_only" | "both";

interface DetectedInfo {
  productName: string;
  primaryBrand: string;
  category: string;
  competitors: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API_PROVIDERS = LLM_PROVIDERS.filter((p) => p.isEnabled);

const CRAWLING_PROVIDERS = [
  { id: "gpt-4-turbo", displayName: "ChatGPT (Web)" },
  { id: "claude-3.5-sonnet", displayName: "Claude (Web)" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const HeroSearchTab: React.FC = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  // ── State ────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>("url_input");
  const [url, setUrl] = useState("");
  const [detectedInfo, setDetectedInfo] = useState<DetectedInfo | null>(null);
  const [analysisMethod, setAnalysisMethod] =
    useState<AnalysisMethod>("api_only");
  const [selectedProviders, setSelectedProviders] = useState<string[]>([
    "gpt-4-turbo",
  ]);
  const [newCompetitor, setNewCompetitor] = useState("");
  const [error, setError] = useState("");

  // ── Server capabilities ──────────────────────────────────────────────────
  const { data: capabilities } = api.analysis.getCapabilities.useQuery();
  const crawlingEnabled = capabilities?.crawlingEnabled ?? false;
  const chatgptCrawlEnabled = capabilities?.chatgptCrawlEnabled ?? false;
  const claudeCrawlEnabled = capabilities?.claudeCrawlEnabled ?? false;

  // If crawling becomes unavailable (e.g. capabilities loaded and it's off),
  // fall back to api_only so the form stays valid.
  useEffect(() => {
    if (capabilities && !crawlingEnabled) {
      setAnalysisMethod("api_only");
    }
  }, [capabilities, crawlingEnabled]);

  // ── tRPC mutations ───────────────────────────────────────────────────────
  const detectWebsite = api.analysis.analyzeWebsite.useMutation({
    onSuccess: (data) => {
      setDetectedInfo({ ...data, competitors: data.competitors });
      setStep("configure");
    },
    onError: (err) => {
      setError(err.message);
      setStep("url_input");
    },
  });

  const createAnalysis = api.analysis.create.useMutation({
    onSuccess: (data) => {
      router.push(`/dashboard/processing/${data.sessionId}`);
    },
  });

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleDetect = () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }
    if (!session) {
      router.push("/login");
      return;
    }
    setError("");
    setStep("detecting");
    detectWebsite.mutate({ url });
  };

  const handleAnalyze = () => {
    if (!detectedInfo) return;
    const validCompetitors = detectedInfo.competitors.filter(
      (c) => c.trim() !== "",
    );
    if (validCompetitors.length < 2) {
      setError("Please add at least 2 competitors");
      return;
    }
    setError("");
    createAnalysis.mutate({
      productName: detectedInfo.productName,
      primaryBrand: detectedInfo.primaryBrand,
      competitors: validCompetitors,
      category: detectedInfo.category,
      selectedProviders,
      promptCount: 5,
      analysisMethod,
    });
  };

  const handleAddCompetitor = () => {
    if (!newCompetitor.trim() || !detectedInfo) return;
    setDetectedInfo({
      ...detectedInfo,
      competitors: [...detectedInfo.competitors, newCompetitor.trim()],
    });
    setNewCompetitor("");
  };

  const handleRemoveCompetitor = (index: number) => {
    if (!detectedInfo) return;
    setDetectedInfo({
      ...detectedInfo,
      competitors: detectedInfo.competitors.filter((_, i) => i !== index),
    });
  };

  const toggleProvider = (providerId: string) => {
    setSelectedProviders((prev) =>
      prev.includes(providerId)
        ? prev.filter((id) => id !== providerId)
        : [...prev, providerId],
    );
  };

  // ── Derived ──────────────────────────────────────────────────────────────

  // Only include crawling providers whose credentials are actually configured
  const availableCrawlingProviders = CRAWLING_PROVIDERS.filter((p) => {
    if (p.id === "gpt-4-turbo") return chatgptCrawlEnabled;
    if (p.id === "claude-3.5-sonnet") return claudeCrawlEnabled;
    return false;
  });

  const visibleProviders =
    analysisMethod === "crawling_only"
      ? availableCrawlingProviders
      : analysisMethod === "api_only"
        ? API_PROVIDERS.map((p) => ({
            id: p.id,
            displayName: p.displayName,
          }))
        : [
            ...API_PROVIDERS.map((p) => ({
              id: p.id,
              displayName: p.displayName,
            })),
            ...availableCrawlingProviders.filter(
              (cp) => !API_PROVIDERS.some((ap) => ap.id === cp.id),
            ),
          ];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="bg-background w-[700px] rounded-lg border transition-all duration-300">
      {/* ── Step 1: URL Input ─────────────────────────────────────────────── */}
      {step === "url_input" && (
        <>
          <div className="flex items-center gap-2 p-3">
            <Globe className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
            <Input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleDetect();
              }}
              placeholder="https://yourwebsite.com"
              className="h-8 flex-1 border-none bg-transparent shadow-none outline-none focus-visible:ring-0"
            />
            <Button size="sm" onClick={handleDetect} className="shrink-0">
              Detect
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          {error && (
            <p className="text-destructive border-t px-3 py-2 text-xs">
              {error}
            </p>
          )}
        </>
      )}

      {/* ── Step 2: Detecting ─────────────────────────────────────────────── */}
      {step === "detecting" && (
        <div className="flex flex-col items-center gap-4 p-8">
          <div className="flex items-center gap-2">
            <Globe className="text-muted-foreground h-4 w-4 shrink-0" />
            <span className="text-muted-foreground truncate text-sm">
              {url}
            </span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <p className="text-sm font-medium">Analyzing your website...</p>
            <p className="text-muted-foreground text-xs">
              Detecting product name, brand, category and competitors
            </p>
          </div>
        </div>
      )}

      {/* ── Step 3: Configure & Analyze ───────────────────────────────────── */}
      {step === "configure" && detectedInfo && (
        <>
          {/* URL bar */}
          <div className="flex items-center gap-2 border-b p-3">
            <Globe className="text-muted-foreground h-4 w-4 shrink-0" />
            <span className="text-muted-foreground flex-1 truncate text-sm">
              {url}
            </span>
            <button
              onClick={() => {
                setStep("url_input");
                setDetectedInfo(null);
                setError("");
              }}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Change
            </button>
          </div>

          {/* Detected info */}
          <div className="border-b p-4">
            <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
              Detected Info
            </p>
            <div className="grid grid-cols-3 gap-3">
              {/* Product Name */}
              <div>
                <p className="text-muted-foreground mb-1 text-xs">
                  Product Name
                </p>
                <Input
                  value={detectedInfo.productName}
                  onChange={(e) =>
                    setDetectedInfo({
                      ...detectedInfo,
                      productName: e.target.value,
                    })
                  }
                  className="h-8 text-sm"
                />
              </div>

              {/* Brand Name */}
              <div>
                <p className="text-muted-foreground mb-1 text-xs">Brand Name</p>
                <Input
                  value={detectedInfo.primaryBrand}
                  onChange={(e) =>
                    setDetectedInfo({
                      ...detectedInfo,
                      primaryBrand: e.target.value,
                    })
                  }
                  className="h-8 text-sm"
                />
              </div>

              {/* Category */}
              <div>
                <p className="text-muted-foreground mb-1 text-xs">Category</p>
                <Input
                  value={detectedInfo.category}
                  onChange={(e) =>
                    setDetectedInfo({
                      ...detectedInfo,
                      category: e.target.value,
                    })
                  }
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {/* Competitors */}
            <div className="mt-3">
              <p className="text-muted-foreground mb-2 text-xs">Competitors</p>
              <div className="flex flex-wrap gap-2">
                {detectedInfo.competitors.map((competitor, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1 text-xs"
                  >
                    {competitor}
                    <button
                      onClick={() => handleRemoveCompetitor(index)}
                      className="hover:text-destructive ml-0.5 rounded-full transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {/* Add competitor inline */}
                <div className="flex items-center gap-1">
                  <Input
                    value={newCompetitor}
                    onChange={(e) => setNewCompetitor(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCompetitor();
                      }
                    }}
                    placeholder="Add competitor…"
                    className="h-6 w-32 border-dashed text-xs"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleAddCompetitor}
                    disabled={!newCompetitor.trim()}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Method */}
          <div className="border-b p-4">
            <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
              Analysis Method
            </p>
            <Tabs
              value={analysisMethod}
              onValueChange={(v) => setAnalysisMethod(v as AnalysisMethod)}
            >
              <TabsList className={cn("w-full", !crawlingEnabled && "w-auto")}>
                <TabsTrigger value="api_only" className="flex-1 text-xs">
                  API Only
                </TabsTrigger>
                {crawlingEnabled && (
                  <>
                    <TabsTrigger
                      value="crawling_only"
                      className="flex-1 text-xs"
                    >
                      Web Crawling
                    </TabsTrigger>
                    <TabsTrigger value="both" className="flex-1 text-xs">
                      Both
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
            </Tabs>
            {!crawlingEnabled && (
              <p className="text-muted-foreground mt-2 text-xs">
                Web Crawling unavailable — set{" "}
                <code className="bg-muted rounded px-1">CHATGPT_EMAIL</code> /{" "}
                <code className="bg-muted rounded px-1">CLAUDE_EMAIL</code> env
                vars to enable.
              </p>
            )}
          </div>

          {/* AI Providers */}
          <div className="border-b p-4">
            <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
              AI Providers
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {visibleProviders.map((provider) => {
                const isSelected = selectedProviders.includes(provider.id);
                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => toggleProvider(provider.id)}
                    className={cn(
                      "flex items-center justify-between rounded border px-3 py-2 text-left text-xs transition-all",
                      isSelected
                        ? "border-primary/60 bg-primary/5"
                        : "border-border hover:border-muted-foreground/50",
                    )}
                  >
                    <span className="font-medium">{provider.displayName}</span>
                    <div
                      className={cn(
                        "ml-2 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/40",
                      )}
                    >
                      {isSelected && (
                        <Check className="text-primary-foreground h-2.5 w-2.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error & Analyze button */}
          <div className="flex items-center justify-between gap-3 p-3">
            {error ? (
              <p className="text-destructive text-xs">{error}</p>
            ) : (
              <span />
            )}
            <Button
              onClick={handleAnalyze}
              disabled={createAnalysis.isPending}
              size="sm"
              className="ml-auto"
            >
              {createAnalysis.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  Analyze
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
