import { useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Download, FolderOpen, Loader2 } from "lucide-react";
import { apiUrls } from "@/lib/constant";

interface Props {
  selectedIds: string[];
}

export function DownloadSection({ selectedIds }: Props) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [folderName, setFolderName] =
    useState("");

  const [folderHandle, setFolderHandle] =
    useState<FileSystemDirectoryHandle | null>(
      null
    );
  
    const chooseFolder = async () => {

    try {

      const handle =
        await window.showDirectoryPicker();

      setFolderHandle(handle);
      setFolderName(handle.name);

      toast.success(
        `Folder selected: ${handle.name}`
      );

    } catch (err) {

      console.log(err);

      toast.error("Folder selection cancelled");
    }
  };
  const submit = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one video");
      return;
    }
     if (!folderHandle) {

       toast.error("Please select folder");
       
       return;
      }
      setError("");
      setLoading(true);
      
      // Convert single backslashes to escaped backslashes for JSON
      // const normalized = path.replace(/\\/g, "\\\\");
      // console.log(normalized);
      
      try {
        
        // console.log("selectedIds",selectedIds);
        for (const id of selectedIds) {
          const response = await axios.get(
            `${apiUrls.download}/${id}`,
            // "http://192.168.0.119:8000/api/download-youtube-video",
            {
              responseType:"blob",
              timeout:1000*60*10 //10 mins
            }
          );
          
          console.log("response",response);
          // console.log("data",response);
          const blob = new Blob(
            [response.data],
            {type:"video/mp4"}
          )
          // console.log("blob",blob);
          const url = window.URL.createObjectURL(blob);
          
          // Extract filename from headers
          const disposition =
          response.headers["content-disposition"];
          
          let filename = `${id}.mp4`;
          
          if (disposition) {
            
            const match =
            disposition.match(/filename="?(.+)"?/);
            
            if (match?.[1]) {
              filename = match[1];
            }
          }
          // save directly to selected folder
          const fileHandle =
          await folderHandle.getFileHandle(
            filename,
            { create: true }
          );
          // console.log(fileHandle);
           const writable =
          await fileHandle.createWritable();

        await writable.write(response.data);

        await writable.close();

        toast.success(`${filename} downloaded`);
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
        {/* <label className="block text-sm font-medium text-foreground">
          Download Folder Path
        </label> */}
        <label className="block text-sm font-medium">
          Selected Folder
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="D:\videos"
            className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-ring"
          /> */}
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
