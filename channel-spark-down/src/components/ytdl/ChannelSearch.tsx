import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Search, Loader2 } from "lucide-react";
import { apiUrls } from "@/lib/constant";

export interface Channel {
  channel_id: string;
  name: string;
  image: string;
  uploads_playlist_id: string;
}

interface Props {
  onFound: (c: Channel) => void;
}

export function ChannelSearch({ onFound }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Channel name is required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.get<Channel>(
        `${apiUrls.channel_search}`,
        // ,``http://192.168.0.119:8000/api/search-youtube-channel`,
        { params: { channel_name: name.trim() } }
      );
      // console.log(data);
      
      if (!data?.channel_id) {
        toast.error("Channel not found");
        return;
      }
      onFound(data);
      toast.success(`Found: ${data.name}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Channel not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        Search YouTube Channel
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter channel name (e.g KidzClubStudio)"
          className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search Channel
        </button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
