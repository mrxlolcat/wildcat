import { useTicker } from "@/hooks/use-market";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";

interface WatchlistItemProps {
  symbol: string;
  onClick: (symbol: string) => void;
  onRemove: (symbol: string) => void;
  isActive: boolean;
}

export function WatchlistItem({ symbol, onClick, onRemove, isActive }: WatchlistItemProps) {
  const { data: ticker, isLoading } = useTicker(symbol);

  if (isLoading) {
    return (
      <div className="p-3 mb-2 rounded-xl bg-card border border-border/50 animate-pulse flex justify-between items-center">
        <div className="w-16 h-5 bg-muted rounded"></div>
        <div className="w-12 h-5 bg-muted rounded"></div>
      </div>
    );
  }

  if (!ticker) return null;

  const priceChange = parseFloat(ticker.priceChangePercent);
  const isPositive = priceChange >= 0;

  return (
    <div
      onClick={() => onClick(symbol)}
      className={cn(
        "group relative flex items-center justify-between p-3 mb-2 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md",
        isActive 
          ? "bg-primary/10 border-primary/50 shadow-sm" 
          : "bg-card border-border/50 hover:bg-muted/50 hover:border-border"
      )}
    >
      <div>
        <h4 className="font-display font-semibold text-sm">{symbol}</h4>
        <span className="text-xs text-muted-foreground font-mono">Vol {parseFloat(ticker.quoteVolume).toLocaleString(undefined, { maximumFractionDigits: 0, notation: 'compact' })}</span>
      </div>

      <div className="text-right">
        <div className="font-mono text-sm font-medium">
          {parseFloat(ticker.lastPrice).toLocaleString()}
        </div>
        <div className={cn("text-xs font-mono font-medium", isPositive ? "text-[hsl(var(--success))]" : "text-[hsl(var(--destructive))]")}>
          {isPositive ? "+" : ""}{priceChange.toFixed(2)}%
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(symbol);
        }}
        className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 p-1 bg-destructive text-destructive-foreground rounded-full shadow-lg transition-opacity"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
