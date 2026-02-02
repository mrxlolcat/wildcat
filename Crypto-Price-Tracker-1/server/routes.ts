import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";

const BINANCE_API = "https://api.binance.us/api/v3";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // --- Favorites Endpoints ---

  app.get(api.favorites.list.path, async (req, res) => {
    const items = await storage.getFavorites();
    res.json(items);
  });

  app.post(api.favorites.create.path, async (req, res) => {
    try {
      const input = api.favorites.create.input.parse(req.body);
      const item = await storage.addFavorite(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
    }
  });

  app.delete(api.favorites.delete.path, async (req, res) => {
    await storage.removeFavorite(req.params.symbol);
    res.status(204).send();
  });

  // --- Market Data Endpoints (Proxy to Binance) ---

  app.get(api.market.candles.path, async (req, res) => {
    const symbol = req.params.symbol;
    const interval = (req.query.interval as string) || '1h';
    
    try {
      const response = await fetch(
        `${BINANCE_API}/klines?symbol=${symbol}&interval=${interval}&limit=100`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch from Binance');
      }

      const data = await response.json();
      
      // Binance format: [open_time, open, high, low, close, volume, ...]
      const formatted = data.map((d: any[]) => ({
        time: d[0],
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
        volume: parseFloat(d[5]),
      }));

      res.json(formatted);
    } catch (err) {
      console.error('Binance API Error:', err);
      res.status(500).json({ message: "Failed to fetch candles" });
    }
  });

  app.get(api.market.ticker.path, async (req, res) => {
    const symbol = req.params.symbol;
    try {
      const response = await fetch(`${BINANCE_API}/ticker/24hr?symbol=${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch ticker');
      
      const data = await response.json();
      res.json({
        symbol: data.symbol,
        lastPrice: data.lastPrice,
        priceChangePercent: data.priceChangePercent,
        volume: data.volume,
        quoteVolume: data.quoteVolume,
      });
    } catch (err) {
       res.status(500).json({ message: "Failed to fetch ticker" });
    }
  });

  app.get(api.market.search.path, async (req, res) => {
    const query = (req.query.query as string || "").toUpperCase();
    try {
      // Fetch all tickers (heavy, but cached by Binance usually)
      // Ideally we cache this in memory for 60s
      const response = await fetch(`${BINANCE_API}/ticker/24hr`);
      if (!response.ok) throw new Error('Failed to fetch tickers');
      
      const data = await response.json();
      
      // Filter top pairs (e.g. USDT pairs) and matching query
      const filtered = data
        .filter((t: any) => t.symbol.endsWith("USDT"))
        .filter((t: any) => !query || t.symbol.includes(query))
        .sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume)) // Sort by volume
        .slice(0, 50) // Limit to top 50
        .map((t: any) => ({
          symbol: t.symbol,
          lastPrice: t.lastPrice,
          priceChangePercent: t.priceChangePercent
        }));

      res.json(filtered);
    } catch (err) {
      res.status(500).json({ message: "Failed to search" });
    }
  });

  // Seed initial data
  seedDatabase().catch(console.error);

  return httpServer;
}

// Helper to seed initial favorites
export async function seedDatabase() {
  const existing = await storage.getFavorites();
  if (existing.length === 0) {
    await storage.addFavorite({ symbol: "BTCUSDT" });
    await storage.addFavorite({ symbol: "ETHUSDT" });
    await storage.addFavorite({ symbol: "SOLUSDT" });
  }
}
