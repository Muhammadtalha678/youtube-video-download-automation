import type { Channel } from "./ChannelSearch";

export function ChannelCard({ channel }: { channel: Channel }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <img
        src={channel.image}
        alt={channel.name}
        className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20"
      />
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Channel</p>
        <h3 className="text-lg font-semibold text-card-foreground">{channel.name}</h3>
      </div>
    </div>
  );
}
