import type { Video } from "./VideoSearch";

interface Props {
  video: Video;
  selected: boolean;
  onToggle: () => void;
}

export function VideoCard({ video, selected, onToggle }: Props) {
  const date = new Date(video.published_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <label
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
        selected ? "border-primary ring-2 ring-primary/40" : "border-border"
      }`}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={video.image}
          alt={video.title}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="absolute top-3 left-3 h-5 w-5 cursor-pointer accent-primary"
        />
      </div>
      <div className="flex flex-col gap-1 p-3">
        <p className=" text-sm font-medium text-card-foreground">{video.title}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
    </label>
  );
}
