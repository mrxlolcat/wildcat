import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type FavoriteInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useFavorites() {
  return useQuery({
    queryKey: [api.favorites.list.path],
    queryFn: async () => {
      const res = await fetch(api.favorites.list.path);
      if (!res.ok) throw new Error("Failed to fetch favorites");
      return api.favorites.list.responses[200].parse(await res.json());
    },
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: FavoriteInput) => {
      const res = await fetch(api.favorites.create.path, {
        method: api.favorites.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.favorites.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to add favorite");
      }
      return api.favorites.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.favorites.list.path] });
      toast({
        title: "Added to Watchlist",
        description: "Symbol is now in your favorites.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (symbol: string) => {
      const url = buildUrl(api.favorites.delete.path, { symbol });
      const res = await fetch(url, { method: api.favorites.delete.method });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Favorite not found");
        throw new Error("Failed to remove favorite");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.favorites.list.path] });
      toast({
        title: "Removed",
        description: "Symbol removed from favorites.",
      });
    },
  });
}
