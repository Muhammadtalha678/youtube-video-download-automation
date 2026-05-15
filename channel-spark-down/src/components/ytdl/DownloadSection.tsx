import { useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Download, FolderOpen, Loader2 } from "lucide-react";
import { apiUrls } from "@/lib/constant";

interface Props {
  selectedIds: string[];
}

export function DownloadSection({ selectedIds }: Props) {
  const [path, setPath] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const folderRef = useRef<HTMLInputElement>(null);

  const browse = () => folderRef.current?.click();

  const onFolderPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Browser cannot return absolute path; use folder name as hint
      const rel = (files[0] as any).webkitRelativePath as string;
      const folder = rel.split("/")[0];
      setPath((prev) => prev || folder);
      
      toast("Browser returns folder name only — please type the full path.", {
        icon: "ℹ️",
      });
    }
  };
  
  const submit = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one video");
      return;
    }
    if (!path.trim()) {
      setError("Download path is required");
      toast.error("Please enter download folder path");
      return;
    }
    setError("");
    setLoading(true);
    
    // Convert single backslashes to escaped backslashes for JSON
    const normalized = path.replace(/\\/g, "\\\\");
    console.log(normalized);

    try {
      const { data } = await axios.post(
        `${apiUrls.dowload_video}`,
        // "http://192.168.0.119:8000/api/download-youtube-video",
        {
          video_ids: selectedIds,
          download_path: normalized,
        }
      );
      const failed = (data?.results || []).filter((r: any) => !r.success).length;
      if (failed > 0) {
        toast.error(`${failed} video(s) failed to download`);
      } else {
        toast.success(data?.message || "Download started successfully");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Download failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Download Folder Path
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="D:\videos"
            className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-ring"
          />
          {/* <button
            type="button"
            onClick={browse}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 py-3 text-sm font-medium hover:bg-accent"
          >
            <FolderOpen className="h-4 w-4" />
            Browse
          </button> */}
          {/* <input
            ref={folderRef}
            type="file"
            // @ts-expect-error non-standard
            webkitdirectory=""
            directory=""
            multiple
            className="hidden"
            onChange={onFolderPicked}
          /> */}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Download Selected Videos {selectedIds.length > 0 && `(${selectedIds.length})`}
      </button>
    </div>
  );
}
