"use client";

import { useState } from "react";
import type { PolicyAnalysis, AnalyzeResponse } from "@/types/analysis";

interface UseAnalyzeState {
  data: PolicyAnalysis | null;
  loading: boolean;
  error: string | null;
}

interface UseAnalyzeReturn extends UseAnalyzeState {
  analyze: (text: string) => Promise<void>;
  reset: () => void;
}

/**
 * React hook for submitting policy text and receiving a structured analysis.
 * Keeps all fetch/error state colocated with a clean interface for the UI.
 */
export function useAnalyze(): UseAnalyzeReturn {
  const [state, setState] = useState<UseAnalyzeState>({
    data: null,
    loading: false,
    error: null,
  });

  async function analyze(text: string) {
    setState({ data: null, loading: true, error: null });

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const json: AnalyzeResponse = await res.json();

      if (!json.ok) {
        setState({ data: null, loading: false, error: json.error });
        return;
      }

      setState({ data: json.data, loading: false, error: null });
    } catch {
      setState({
        data: null,
        loading: false,
        error: "A network error occurred. Please check your connection and try again.",
      });
    }
  }

  function reset() {
    setState({ data: null, loading: false, error: null });
  }

  return { ...state, analyze, reset };
}
