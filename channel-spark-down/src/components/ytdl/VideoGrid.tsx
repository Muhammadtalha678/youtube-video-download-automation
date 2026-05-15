import type { Video } from "./VideoSearch";
import { VideoCard } from "./VideoCard";

interface Props {
  videos: Video[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}

export function VideoGrid({ videos, selected, onToggle, onToggleAll }: Props) {
  if (!videos.length) return null;
  const allSelected = selected.size === videos.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Videos <span className="text-muted-foreground">({videos.length})</span>
        </h3>
        <button
          type="button"
          onClick={onToggleAll}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent"
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {videos.map((v) => (
          <VideoCard
            key={v.id}
            video={v}
            selected={selected.has(v.id)}
            onToggle={() => onToggle(v.id)}
          />
        ))}
      </div>
    </div>
  );
}
