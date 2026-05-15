import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { Youtube } from "lucide-react";
import { ChannelSearch, type Channel } from "@/components/ytdl/ChannelSearch";
import { ChannelCard } from "@/components/ytdl/ChannelCard";
import { VideoSearch, type Video } from "@/components/ytdl/VideoSearch";
import { VideoGrid } from "@/components/ytdl/VideoGrid";
import { DownloadSection } from "@/components/ytdl/DownloadSection";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === videos.length ? new Set() : new Set(videos.map((v) => v.id))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40">
      <Toaster position="top-right" />

      <header className="border-b border-border/60 bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-4 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <Youtube className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            YouTube Channel Video Downloader
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        {/* Step 1 */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <StepBadge n={1} title="Search Channel" />
          <div className="mt-4">
            <ChannelSearch
              onFound={(c) => {
                setChannel(c);
                setVideos([]);
                setSelected(new Set());
              }}
            />
          </div>
          {channel && (
            <div className="mt-5">
              <ChannelCard channel={channel} />
            </div>
          )}
        </section>

        {/* Step 2 */}
        {channel && (
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <StepBadge n={2} title="Search Videos" />
            <div className="mt-4">
              <VideoSearch
                uploadsId={channel.uploads_playlist_id}
                onResults={(v) => {
                  setVideos(v);
                  setSelected(new Set());
                }}
              />
            </div>
          </section>
        )}

        {/* Step 3 */}
        {videos.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <StepBadge n={3} title="Select & Download" />
            <div className="mt-4 space-y-6">
              <VideoGrid
                videos={videos}
                selected={selected}
                onToggle={toggle}
                onToggleAll={toggleAll}
              />
              <DownloadSection selectedIds={Array.from(selected)} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function StepBadge({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
        {n}
      </span>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
    </div>
  );
}
