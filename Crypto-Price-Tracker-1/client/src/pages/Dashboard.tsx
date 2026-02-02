import { useState } from "react";
import { Header } from "@/components/Header";
import { ChartContainer } from "@/components/ChartContainer";
import { WatchlistItem } from "@/components/WatchlistItem";
import { useFavorites, useRemoveFavorite } from "@/hooks/use-favorites";
import { Loader2, LayoutGrid, Star, Github } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setInterval] = useState("1h");
  const { data: favorites, isLoading: loadingFavorites } = useFavorites();
  const { mutate: removeFavorite } = useRemoveFavorite();

  return (
    <div className="min-h-screen bg-background text-foreground font-body flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar / Watchlist */}
      <aside className="w-full md:w-80 border-r border-border bg-card/30 backdrop-blur-xl flex flex-col h-[40vh] md:h-screen sticky top-0 z-20">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">Trade<span className="text-primary">View</span></span>
          </div>
          
          <Tabs defaultValue="watchlist" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
              <TabsTrigger value="market" disabled>Market</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-1">
            {loadingFavorites ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : favorites?.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="bg-muted/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No favorites yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Search symbols to add them here</p>
              </div>
            ) : (
              favorites?.map((fav) => (
                <WatchlistItem 
                  key={fav.symbol} 
                  symbol={fav.symbol} 
                  isActive={symbol === fav.symbol}
                  onClick={setSymbol}
                  onRemove={(s) => removeFavorite(s)}
                />
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t border-border/50">
          <a href="https://github.com/replit/stack" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-sm text-muted-foreground">
             <Github className="w-4 h-4" />
             <span>Powered by Replit Stack</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
          
          {/* Header Section */}
          <Header 
            currentSymbol={symbol} 
            onSymbolChange={setSymbol}
            interval={interval}
            onIntervalChange={setInterval}
          />

          {/* Chart Section */}
          <section className="relative">
             <ChartContainer symbol={symbol} interval={interval} />
          </section>

          {/* Additional Info Grid (Mock for visual completeness) */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Market Sentiment
              </h3>
              <div className="h-2 bg-secondary rounded-full overflow-hidden flex">
                <div className="w-[65%] bg-[hsl(var(--success))] h-full" />
                <div className="w-[35%] bg-[hsl(var(--destructive))] h-full" />
              </div>
              <div className="flex justify-between mt-2 text-xs font-mono">
                <span className="text-[hsl(var(--success))]">65% Buy</span>
                <span className="text-[hsl(var(--destructive))]">35% Sell</span>
              </div>
            </div>
            
            <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
              <h3 className="font-display font-semibold mb-2">Order Book</h3>
              <div className="space-y-2 text-xs font-mono">
                 <div className="flex justify-between text-muted-foreground">
                    <span>Price</span>
                    <span>Amount</span>
                    <span>Total</span>
                 </div>
                 {[1,2,3].map(i => (
                   <div key={i} className="flex justify-between relative group">
                      <div className="absolute inset-0 bg-[hsl(var(--destructive))] opacity-[0.05] w-[40%] right-0"></div>
                      <span className="text-[hsl(var(--destructive))]">{(65000 + i * 10).toLocaleString()}</span>
                      <span>0.{(i*345)}</span>
                      <span className="text-muted-foreground">23.4K</span>
                   </div>
                 ))}
                 <div className="border-t border-border/50 my-1"></div>
                 {[1,2,3].map(i => (
                   <div key={i} className="flex justify-between relative">
                      <div className="absolute inset-0 bg-[hsl(var(--success))] opacity-[0.05] w-[60%] right-0"></div>
                      <span className="text-[hsl(var(--success))]">{(64900 - i * 10).toLocaleString()}</span>
                      <span>0.{(i*512)}</span>
                      <span className="text-muted-foreground">45.2K</span>
                   </div>
                 ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
               <h3 className="font-display font-semibold mb-2">About {symbol}</h3>
               <p className="text-sm text-muted-foreground leading-relaxed">
                 Bitcoin is a decentralized digital currency, without a central bank or single administrator, that can be sent from user to user on the peer-to-peer bitcoin network without the need for intermediaries.
               </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
