import { db } from "./db";
import { favorites, type Favorite, type InsertFavorite } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getFavorites(): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(symbol: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getFavorites(): Promise<Favorite[]> {
    return await db.select().from(favorites);
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newItem] = await db.insert(favorites).values(favorite).onConflictDoNothing().returning();
    if (!newItem) {
      // If it already exists, just return the existing one
      const [existing] = await db.select().from(favorites).where(eq(favorites.symbol, favorite.symbol));
      return existing;
    }
    return newItem;
  }

  async removeFavorite(symbol: string): Promise<void> {
    await db.delete(favorites).where(eq(favorites.symbol, symbol));
  }
}

export const storage = new DatabaseStorage();
