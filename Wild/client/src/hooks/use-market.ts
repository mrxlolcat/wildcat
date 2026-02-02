import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// Types derived from schema
type Candle = z.infer<typeof api.market.candles.responses[200]>[number];
type Ticker = z.infer<typeof api.market.ticker.responses[200]>;
type SearchResult = z.infer<typeof api.market.search.responses[200]>[number];

export function useCandles(symbol: string, interval: string = '1h') {
  return useQuery({
    queryKey: [api.market.candles.path, symbol, interval],
    queryFn: async () => {
      // Construct URL with query params manually since buildUrl only handles path params
      const basePath = buildUrl(api.market.candles.path, { symbol });
      const url = `${basePath}?interval=${interval}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch candles");
      return api.market.candles.responses[200].parse(await res.json());
    },
    refetchInterval: 1000 * 60, // Refresh every minute
    enabled: !!symbol,
  });
}

export function useTicker(symbol: string) {
  return useQuery({
    queryKey: [api.market.ticker.path, symbol],
    queryFn: async () => {
      const url = buildUrl(api.market.ticker.path, { symbol });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch ticker");
      return api.market.ticker.responses[200].parse(await res.json());
    },
    refetchInterval: 5000, // Refresh every 5 seconds for live feel
    enabled: !!symbol,
  });
}

export function useMarketSearch(query: string) {
  return useQuery({
    queryKey: [api.market.search.path, query],
    queryFn: async () => {
      if (!query) return [];
      const url = `${api.market.search.path}?query=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to search market");
      return api.market.search.responses[200].parse(await res.json());
    },
    enabled: query.length > 1,
    staleTime: 1000 * 60 * 5, // Cache search results for 5 mins
  });
}
