import { useCandles } from "@/hooks/use-market";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartContainerProps {
  symbol: string;
  interval: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover/95 backdrop-blur-md border border-border p-3 rounded-lg shadow-xl text-xs font-mono">
        <p className="text-muted-foreground mb-1">{format(new Date(data.time), 'MMM dd HH:mm')}</p>
        <div className="space-y-1">
          <p className="flex justify-between gap-4"><span className="text-primary">Close:</span> <span>{data.close.toLocaleString()}</span></p>
          <p className="flex justify-between gap-4"><span className="text-muted-foreground">Open:</span> <span>{data.open.toLocaleString()}</span></p>
          <p className="flex justify-between gap-4"><span className="text-[hsl(var(--success))]">High:</span> <span>{data.high.toLocaleString()}</span></p>
          <p className="flex justify-between gap-4"><span className="text-[hsl(var(--destructive))]">Low:</span> <span>{data.low.toLocaleString()}</span></p>
          <p className="flex justify-between gap-4"><span className="text-muted-foreground">Vol:</span> <span>{data.volume.toLocaleString()}</span></p>
        </div>
      </div>
    );
  }
  return null;
};

export function ChartContainer({ symbol, interval }: ChartContainerProps) {
  const { data: candles, isLoading, isError } = useCandles(symbol, interval);

  if (isLoading) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-card/50 rounded-2xl animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-muted-foreground font-display">Loading market data...</p>
        </div>
      </div>
    );
  }

  if (isError || !candles || candles.length === 0) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-card/50 rounded-2xl border border-border/50">
        <p className="text-muted-foreground">No data available for {symbol}</p>
      </div>
    );
  }

  // Determine trend for coloring
  const firstPrice = candles[0].close;
  const lastPrice = candles[candles.length - 1].close;
  const isUp = lastPrice >= firstPrice;
  const color = isUp ? "hsl(var(--success))" : "hsl(var(--destructive))";

  return (
    <Card className="p-1 h-[500px] bg-card border-border/50 shadow-2xl overflow-hidden relative group">
       {/* Background Grid Pattern */}
       <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
       </div>

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={candles} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.3} />
          
          <XAxis 
            dataKey="time" 
            tickFormatter={(time) => format(new Date(time), interval === '1d' || interval === '1w' ? 'MMM dd' : 'HH:mm')}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickMargin={10}
            minTickGap={50}
            axisLine={false}
            tickLine={false}
          />
          
          <YAxis 
            yAxisId="right"
            orientation="right"
            domain={['auto', 'auto']}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(val) => val.toLocaleString()}
            axisLine={false}
            tickLine={false}
            width={60}
          />

          <YAxis 
            yAxisId="left"
            orientation="left"
            tick={false}
            axisLine={false}
            width={0}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }} />

          {/* Volume Bars */}
          <Bar 
            yAxisId="left"
            dataKey="volume" 
            fill="url(#colorVol)" 
            barSize={interval === '1w' ? 10 : 4}
            opacity={0.5}
            radius={[2, 2, 0, 0]}
          />

          {/* Price Area */}
          <Area 
            yAxisId="right"
            type="monotone" 
            dataKey="close" 
            stroke={color} 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            animationDuration={1500}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}
