import { useState } from "react";
import toast from "react-hot-toast";
import { Download, FolderOpen, Loader2, CheckCircle2 } from "lucide-react";
import { apiUrls } from "@/lib/constant";

interface Props {
  selectedIds: string[];
}

interface ProgressState {
  current: number;
  total: number;
  received: number;   // bytes downloaded so far
  filename: string;
}

// Helper to format bytes nicely
const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function DownloadSection({ selectedIds }: Props) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderHandle, setFolderHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [doneCount, setDoneCount] = useState(0);

  const chooseFolder = async () => {
    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      setFolderHandle(handle);
      setFolderName(handle.name);
      toast.success(`Folder selected: ${handle.name}`);
    } catch {
      toast.error("Folder selection cancelled");
    }
  };

 const downloadOne = async (id: string, index: number) => {
  const response = await fetch(`${apiUrls.download}/${id}`);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.detail || `Server error: ${response.status}`);
  }

  // Extract filename
  const disposition = response.headers.get("content-disposition");
let filename = `${id}.mp4`;
if (disposition) {
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;\n]+)/i);
  const asciiMatch = disposition.match(/filename="?([^";\n]+)"?/i);
  if (utf8Match?.[1]) filename = decodeURIComponent(utf8Match[1].trim());
  else if (asciiMatch?.[1]) filename = asciiMatch[1].trim();
}
// Sanitize filename — remove ALL characters not allowed by File System API
filename = filename
  .replace(/[<>:"/\\|?*#%&{}$!@`=+]/g, "")   // remove illegal chars
  .replace(/[\u0000-\u001F\u007F]/g, "")        // remove control characters  
  .replace(/\s+/g, " ")                          // collapse multiple spaces
  .trim();

// Remove trailing dots/spaces (Windows doesn't allow them)
filename = filename.replace(/[. ]+$/, "");

// Ensure it ends with .mp4
if (!filename.endsWith(".mp4")) filename += ".mp4";


// Fallback if everything got stripped
if (filename === ".mp4" || filename.length < 5) filename = `${id}.mp4`;

  // Permission check
  const perm = await folderHandle!.requestPermission({ mode: "readwrite" });
  if (perm !== "granted") throw new Error("Folder permission denied");

  const fileHandle = await folderHandle!.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  const reader = response.body!.getReader();
  let received = 0;

  setProgress({ current: index + 1, total: selectedIds.length, received: 0, filename });

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    await writable.write(value);
    received += value.byteLength;

    // Update every chunk — no percentage, just bytes
    setProgress({
      current: index + 1,
      total: selectedIds.length,
      received,
      filename,
    });
  }

  await writable.close();
  setDoneCount((d) => d + 1);
  toast.success(`✓ ${filename}`);
};
  const submit = async () => {
    if (selectedIds.length === 0) return toast.error("Select at least one video");
    if (!folderHandle) return toast.error("Please select a download folder first");

    setError("");
    setLoading(true);
    setDoneCount(0);
    setProgress(null);

    try {
      for (let i = 0; i < selectedIds.length; i++) {
        await downloadOne(selectedIds[i], i);
      }
      toast.success(`All ${selectedIds.length} videos downloaded!`);
    } catch (err: any) {
      console.log(err);
      
      const msg = err?.message || "Download failed";
      setError(msg);
      if (err?.name === "NotAllowedError") {
        toast.error("Folder permission expired. Re-select your folder.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };


  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">

      {/* Folder picker */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Selected Folder</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={folderName}
            readOnly
            placeholder="No folder selected"
            className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm"
          />
          <button
            type="button"
            onClick={chooseFolder}
            className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-3 text-sm font-medium hover:bg-accent"
          >
            <FolderOpen className="h-4 w-4" />
            Browse
          </button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Progress UI — only shown while downloading */}
     {loading && progress && (
  <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4">

    {/* Current file info */}
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span className="truncate max-w-[70%]">📥 {progress.filename}</span>
      <span className="font-medium">{progress.current}/{progress.total}</span>
    </div>

    {/* Animated indeterminate bar for current video */}
    <div>
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>Downloading...</span>
        <span className="tabular-nums font-medium">
          {formatBytes(progress.received)}
        </span>
      </div>
      {/* Indeterminate shimmer bar — no percentage needed */}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div className="h-full w-full rounded-full bg-primary animate-[shimmer_1.5s_ease-in-out_infinite]"
          style={{
            background: "linear-gradient(90deg, transparent 0%, hsl(var(--primary)) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s ease-in-out infinite",
          }}
        />
      </div>
    </div>

    {/* Overall — determinate since we know total video count */}
    <div>
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>Overall ({doneCount} of {selectedIds.length} done)</span>
        <span className="tabular-nums">
          {Math.round((doneCount / selectedIds.length) * 100)}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-500 ease-out"
          style={{ width: `${Math.round((doneCount / selectedIds.length) * 100)}%` }}
        />
      </div>
    </div>

  </div>
)}

      {/* Download button */}
      <button
        type="button"
        onClick={submit}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Downloading {progress?.current ?? 0}/{selectedIds.length}...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Download Selected Videos
            {selectedIds.length > 0 && (
              <span className="ml-1 rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs">
                {selectedIds.length}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
}