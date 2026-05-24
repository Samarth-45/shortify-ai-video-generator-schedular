"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import type { SeriesRecord } from "@/lib/series";

type SeriesDataContextValue = {
    series: SeriesRecord[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
};

const SeriesDataContext = createContext<SeriesDataContextValue | null>(null);

export function SeriesDataProvider({ children }: { children: ReactNode }) {
    const [series, setSeries] = useState<SeriesRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setError(null);
        try {
            const res = await fetch("/api/series", { cache: "no-store" });
            const payload = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(
                    typeof payload.error === "string"
                        ? payload.error
                        : "Failed to load series"
                );
            }

            setSeries(Array.isArray(payload.series) ? payload.series : []);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load series"
            );
            setSeries([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const hasGenerating = series.some((s) => s.status === "generating");

    useEffect(() => {
        if (!hasGenerating) return;

        const interval = setInterval(() => {
            void refresh();
        }, 5000);

        return () => clearInterval(interval);
    }, [hasGenerating, refresh]);

    return (
        <SeriesDataContext.Provider value={{ series, isLoading, error, refresh }}>
            {children}
        </SeriesDataContext.Provider>
    );
}

export function useSeriesData() {
    const ctx = useContext(SeriesDataContext);
    if (!ctx) {
        throw new Error("useSeriesData must be used within SeriesDataProvider");
    }
    return ctx;
}
