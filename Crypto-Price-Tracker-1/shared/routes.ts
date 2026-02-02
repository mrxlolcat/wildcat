import { z } from 'zod';
import { insertFavoriteSchema, favorites } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  favorites: {
    list: {
      method: 'GET' as const,
      path: '/api/favorites',
      responses: {
        200: z.array(z.custom<typeof favorites.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/favorites',
      input: insertFavoriteSchema,
      responses: {
        201: z.custom<typeof favorites.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/favorites/:symbol',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  market: {
    candles: {
      method: 'GET' as const,
      path: '/api/market/candles/:symbol',
      input: z.object({
        interval: z.enum(['1m', '5m', '15m', '1h', '4h', '1d', '1w']).optional().default('1h'),
      }).optional(),
      responses: {
        200: z.array(z.object({
          time: z.number(),
          open: z.number(),
          high: z.number(),
          low: z.number(),
          close: z.number(),
          volume: z.number(),
        })),
      },
    },
    ticker: {
      method: 'GET' as const,
      path: '/api/market/ticker/:symbol',
      responses: {
        200: z.object({
          symbol: z.string(),
          lastPrice: z.string(),
          priceChangePercent: z.string(),
          volume: z.string(),
          quoteVolume: z.string(),
        }),
        404: errorSchemas.notFound,
      },
    },
    search: {
      method: 'GET' as const,
      path: '/api/market/search',
      input: z.object({
        query: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.object({
          symbol: z.string(),
          lastPrice: z.string(),
          priceChangePercent: z.string(),
        })),
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type FavoriteInput = z.infer<typeof api.favorites.create.input>;
export type FavoriteResponse = z.infer<typeof api.favorites.create.responses[201]>;
