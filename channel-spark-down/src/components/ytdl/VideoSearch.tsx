import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2, Calendar } from "lucide-react";
import { apiUrls } from "@/lib/constant";

export interface Video {
  title: string;
  id: string;
  image: string;
  published_at: string;
}

interface Props {
  uploadsId: string;
  onResults: (videos: Video[]) => void;
}

export function VideoSearch({ uploadsId, onResults }: Props) {
  const [days, setDays] = useState<string>("10");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(days);
    
    if (!days || Number(days) <= 0) {
      setError("Please enter number of days");
      toast.error("Please enter number of days");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.get<Video[]>(
        `${apiUrls.video_search}`,
        // `http://192.168.0.119:8000/api/channel_youtube_videos`,
        { params: { upload_id: uploadsId, past_days: Number(days) } }
      );
      onResults(data || []);
      toast.success(`Found ${data?.length ?? 0} videos`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        Enter number of past days
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="number"
          min={1}
          value={days}
          onChange={(e) => setDays(e.target.value)}
          placeholder="e.g 10, 20, 30, 60"
          className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
          Search Videos
        </button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
