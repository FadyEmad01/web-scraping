"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Checkbox } from "./ui/checkbox";
import { Loader2 } from "lucide-react";

type ScrapedData = {
  images: string[];
  videos: string[];
  audio: string[];
  iframes: string[];
};

function getProxyUrl(url: string) {
  return `/api/proxy?url=${encodeURIComponent(url)}`;
}

function getDownloadUrl(url: string) {
  return `/api/proxy?dl=true&url=${encodeURIComponent(url)}`;
}

export default function ScrapedContent({
  data,
}: {
  data: ScrapedData;
}) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);

  const toggleItem = (url: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(url)) {
        newSet.delete(url);
      } else {
        newSet.add(url);
      }
      return newSet;
    });
  };

  const downloadSingle = (url: string) => {
    const a = document.createElement("a");
    a.href = getDownloadUrl(url);
    a.download = url.split("/").pop()?.split("?")[0] || "download";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadBatch = async (urls: string[]) => {
    setIsDownloading(true);
    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Download failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "assets-downloader.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Files downloaded successfully!");
    } catch (error) {
      console.error("Error downloading files:", error);
      toast.error("Failed to download files");
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadSelected = () => downloadBatch(Array.from(selectedItems));
  const downloadAll = (type: keyof ScrapedData) => downloadBatch(data[type]);
  const downloadAllTypes = () => downloadBatch(Object.values(data).flat());

  const totalCount = Object.values(data).flat().length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Scraped Content</h2>
      <div className="flex space-x-2">
        <button
          onClick={downloadSelected}
          disabled={isDownloading || selectedItems.size === 0}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-2"
        >
          {isDownloading && <Loader2 className="h-4 w-4 animate-spin" />}
          Download Selected ({selectedItems.size})
        </button>
        <button
          onClick={downloadAllTypes}
          disabled={isDownloading || totalCount === 0}
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-400 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-2"
        >
          {isDownloading && <Loader2 className="h-4 w-4 animate-spin" />}
          Download All ({totalCount})
        </button>
      </div>
      {Object.entries(data).map(([type, urls]) => (
        <div key={type}>
          {urls.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold capitalize">
                {type} ({urls.length})
              </h3>
              <button
                onClick={() => downloadAll(type as keyof ScrapedData)}
                disabled={isDownloading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-2"
              >
                {isDownloading && <Loader2 className="h-4 w-4 animate-spin" />}
                Download All {type}
              </button>
              <div className="columns-2 md:columns-3 lg:columns-4">
                {urls.map((url) => (
                  <div
                    key={url}
                    className="inline-block mb-4 w-full rounded-md transition duration-300 ease-in-out"
                  >
                    <div className="relative flex cursor-pointer flex-col rounded-lg border-2 border-transparent p-2 has-[[data-state=checked]]:border-blue-500 has-[[data-state=checked]]:border-2">
                      <div className="relative group">
                        {type === "images" && (
                          <img
                            src={getProxyUrl(url) || "/placeholder.svg"}
                            alt="Scraped"
                            className="relative w-full h-full object-cover rounded-sm"
                          />
                        )}
                        {type === "videos" && (
                          <video
                            autoPlay
                            loop
                            muted
                            src={getProxyUrl(url)}
                            className="w-full aspect-video object-cover rounded-sm"
                          />
                        )}
                        {type === "audio" && (
                          <audio
                            src={getProxyUrl(url)}
                            controls
                            className="w-full rounded-sm"
                          />
                        )}
                        {type === "iframes" && (
                          <iframe src={url} className="w-full rounded-sm" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadSingle(url);
                          }}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-black/70 text-white text-xs rounded"
                        >
                          Download
                        </button>
                      </div>
                      <Checkbox
                        id={url}
                        value={url}
                        checked={selectedItems.has(url)}
                        onCheckedChange={() => toggleItem(url)}
                        className="absolute top-0 right-0 w-full h-full z-50 order-1 opacity-0 border-primary data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
