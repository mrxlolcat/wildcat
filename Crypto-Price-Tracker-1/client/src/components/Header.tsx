import { useState, useEffect } from "react";
import { useTicker, useMarketSearch } from "@/hooks/use-market";
import { useAddFavorite, useFavorites, useRemoveFavorite } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";
import { Search, Star, TrendingUp, TrendingDown, Clock, Activity } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  currentSymbol: string;
  onSymbolChange: (symbol: string) => void;
  interval: string;
  onIntervalChange: (interval: string) => void;
}

export function Header({ currentSymbol, onSymbolChange, interval, onIntervalChange }: HeaderProps) {
  const { data: ticker } = useTicker(currentSymbol);
  const { data: favorites } = useFavorites();
  const { mutate: addFavorite } = useAddFavorite();
  const { mutate: removeFavorite } = useRemoveFavorite();
  
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults } = useMarketSearch(searchQuery);

  // Keyboard shortcut for search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const isFavorite = favorites?.some(f => f.symbol === currentSymbol);
  
  const toggleFavorite = () => {
    if (isFavorite) {
      removeFavorite(currentSymbol);
    } else {
      addFavorite({ symbol: currentSymbol });
    }
  };

  const priceChange = ticker ? parseFloat(ticker.priceChangePercent) : 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Symbol Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
               <Activity className="w-6 h-6" />
             </div>
             <div>
               <h1 className="text-3xl font-display font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                 {currentSymbol}
               </h1>
               <div className="flex items-center gap-2">
                 <span className="text-xs text-muted-foreground font-mono">PERPETUAL CONTRACT</span>
               </div>
             </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFavorite}
            className={cn(
              "ml-2 transition-all duration-300",
              isFavorite ? "text-yellow-400 hover:text-yellow-500 hover:bg-yellow-400/10" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Star className={cn("w-6 h-6", isFavorite && "fill-current")} />
          </Button>
        </div>

        {/* Search Trigger */}
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="w-full md:w-64 justify-between bg-card/50 border-border/50 text-muted-foreground hover:text-foreground hover:bg-card hover:border-border transition-all shadow-sm"
            onClick={() => setOpen(true)}
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search market...
            </span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>
      </div>

      {/* Stats & Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        {/* Price Stats */}
        <div className="md:col-span-8 flex flex-wrap gap-8 items-end p-6 rounded-2xl bg-card border border-border/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5">
             <Activity className="w-32 h-32" />
          </div>
          
          <div>
            <span className="text-sm text-muted-foreground font-medium mb-1 block">Last Price</span>
            {ticker ? (
              <div className="text-4xl font-mono font-bold tracking-tighter text-foreground">
                ${parseFloat(ticker.lastPrice).toLocaleString()}
              </div>
            ) : (
               <div className="h-10 w-40 bg-muted/50 rounded animate-pulse" />
            )}
          </div>

          <div className="min-w-[100px]">
            <span className="text-sm text-muted-foreground font-medium mb-1 block">24h Change</span>
            {ticker ? (
              <div className={cn(
                "flex items-center gap-2 text-xl font-mono font-bold",
                isPositive ? "text-[hsl(var(--success))]" : "text-[hsl(var(--destructive))]"
              )}>
                {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                {isPositive ? "+" : ""}{priceChange.toFixed(2)}%
              </div>
            ) : (
              <div className="h-7 w-24 bg-muted/50 rounded animate-pulse" />
            )}
          </div>

          <div className="hidden sm:block">
            <span className="text-sm text-muted-foreground font-medium mb-1 block">24h Volume</span>
             {ticker ? (
              <div className="text-xl font-mono font-medium text-foreground">
                {parseFloat(ticker.quoteVolume).toLocaleString(undefined, { maximumFractionDigits: 0, notation: 'compact' })}
              </div>
            ) : (
               <div className="h-7 w-24 bg-muted/50 rounded animate-pulse" />
            )}
          </div>
        </div>

        {/* Timeframe Select */}
        <div className="md:col-span-4 flex flex-col gap-2">
           <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">Time Interval</span>
           <div className="bg-card p-1 rounded-xl border border-border/50 flex shadow-sm">
            {['1m', '15m', '1h', '4h', '1d', '1w'].map((tf) => (
              <button
                key={tf}
                onClick={() => onIntervalChange(tf)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative",
                  interval === tf 
                    ? "text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {interval === tf && (
                   <div className="absolute inset-0 bg-primary rounded-lg z-0" />
                )}
                <span className="relative z-10">{tf.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search symbol (e.g. BTC, ETH)..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Results">
            {searchResults?.map((result) => (
              <CommandItem
                key={result.symbol}
                onSelect={() => {
                  onSymbolChange(result.symbol);
                  setOpen(false);
                }}
                className="cursor-pointer"
              >
                <div className="flex justify-between w-full items-center">
                  <span className="font-bold">{result.symbol}</span>
                  <div className="flex gap-4 text-sm">
                    <span className="font-mono">${parseFloat(result.lastPrice).toLocaleString()}</span>
                    <span className={cn(
                      "font-mono w-16 text-right",
                      parseFloat(result.priceChangePercent) >= 0 ? "text-[hsl(var(--success))]" : "text-[hsl(var(--destructive))]"
                    )}>
                      {parseFloat(result.priceChangePercent) > 0 ? "+" : ""}{parseFloat(result.priceChangePercent).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
