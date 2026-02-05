import { useEffect, useMemo, useState } from "react";
import sdk from "@farcaster/miniapp-sdk";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Minus, Plus, RotateCcw } from "lucide-react";

type MiniAppProfile = {
  fid?: number;
  displayName?: string;
  username?: string;
  pfpUrl?: string;
};

type InitState = "loading" | "ready" | "not-miniapp" | "error";

const MAX_BERRIES = 99;

export default function Dashboard() {
  const [initState, setInitState] = useState<InitState>("loading");
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [profile, setProfile] = useState<MiniAppProfile | null>(null);
  const [count, setCount] = useState(1);
  const [isComposing, setIsComposing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initMiniApp() {
      setErrorMessage(null);
      setInitState("loading");

      try {
        const inMiniApp = await sdk.isInMiniApp();
        if (cancelled) return;

        setIsInMiniApp(inMiniApp);

        if (!inMiniApp) {
          setInitState("not-miniapp");
          return;
        }

        const context = await sdk.context;
        if (cancelled) return;

        setProfile({
          fid: context.user?.fid,
          displayName: context.user?.displayName,
          username: context.user?.username,
          pfpUrl: context.user?.pfpUrl,
        });

        await sdk.actions.ready();
        if (cancelled) return;

        setInitState("ready");
      } catch (error) {
        if (cancelled) return;

        const message =
          error instanceof Error
            ? error.message
            : "Gagal menginisialisasi Farcaster Mini App SDK";

        setErrorMessage(message);
        setInitState("error");
      }
    }

    initMiniApp();

    return () => {
      cancelled = true;
    };
  }, []);

  const castText = useMemo(() => {
    const author = profile?.username ? `@${profile.username}` : "Saya";
    return `${author} baru panen ${count} wildberries di mini app Wild Harvest 🍓`;
  }, [count, profile?.username]);

  async function handleComposeCast() {
    if (!isInMiniApp || initState !== "ready") {
      return;
    }

    setIsComposing(true);
    setErrorMessage(null);

    try {
      await sdk.actions.composeCast({
        text: castText,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal membuka composer cast";
      setErrorMessage(message);
    } finally {
      setIsComposing(false);
    }
  }

  function statusLabel() {
    switch (initState) {
      case "loading":
        return "⏳ Menyiapkan SDK...";
      case "ready":
        return "✅ SDK siap dipakai";
      case "not-miniapp":
        return "🌐 Mode web preview (bukan Warpcast)";
      case "error":
        return "⚠️ SDK gagal diinisialisasi";
      default:
        return "-";
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6 md:p-10 text-foreground">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="gap-1 text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                Farcaster Mini App
              </Badge>
              <Badge variant={isInMiniApp ? "default" : "outline"}>
                {isInMiniApp ? "Warpcast" : "Web Preview"}
              </Badge>
            </div>
            <CardTitle className="text-2xl md:text-3xl">Wild Harvest</CardTitle>
            <CardDescription>
              Mini app sederhana untuk panen wildberries, lihat context user, lalu
              langsung compose cast.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-xl border bg-card p-4 space-y-1">
              <p className="text-sm text-muted-foreground">Status SDK</p>
              <p className="font-medium">{statusLabel()}</p>
              {errorMessage ? (
                <p className="text-xs text-[hsl(var(--destructive))]">{errorMessage}</p>
              ) : null}
            </div>

            <div className="rounded-xl border bg-card p-4">
              <p className="mb-2 text-sm text-muted-foreground">Profil pengguna</p>
              {profile ? (
                <div className="flex items-center gap-3">
                  {profile.pfpUrl ? (
                    <img
                      src={profile.pfpUrl}
                      alt={profile.displayName ?? "Profile"}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : null}
                  <div>
                    <p className="font-medium leading-tight">
                      {profile.displayName ?? "Anon"}
                    </p>
                    <p className="text-sm text-muted-foreground leading-tight">
                      @{profile.username ?? "unknown"} · FID {profile.fid ?? "-"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Buka dari Warpcast untuk membaca user context.
                </p>
              )}
            </div>

            <div className="rounded-xl border bg-card p-4 space-y-4">
              <p className="text-sm text-muted-foreground">Jumlah wildberries</p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCount((value) => Math.max(1, value - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <p className="min-w-16 text-center text-3xl font-bold">{count}</p>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCount((value) => Math.min(MAX_BERRIES, value + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCount(1)}
                  aria-label="Reset wildberries"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="rounded-lg bg-muted/40 p-3 text-sm">
                <p className="mb-1 text-xs text-muted-foreground">Preview cast</p>
                <p>{castText}</p>
              </div>

              <Button
                onClick={handleComposeCast}
                disabled={initState !== "ready" || isComposing}
                className="w-full gap-2"
              >
                <Send className="h-4 w-4" />
                {isComposing ? "Membuka composer..." : "Compose cast hasil panen"}
              </Button>

              {initState !== "ready" ? (
                <p className="text-xs text-muted-foreground">
                  Tombol compose aktif saat aplikasi berjalan di Warpcast Mini Apps
                  dan SDK berhasil diinisialisasi.
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
